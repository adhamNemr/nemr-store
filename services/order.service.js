const { Order, OrderItem, Product, User, sequelize } = require("../models");
const { Op } = require("sequelize");

class OrderService {
    async createOrder(userId, items) {
        return await sequelize.transaction(async (t) => {
            let total = 0;
            const order = await Order.create({ 
                userId, 
                totalPrice: 0, 
                status: "pending" 
            }, { transaction: t });

            for (const item of items) {
                const product = await Product.findByPk(item.productId);
                if (!product) throw new Error(`Product ID ${item.productId} not found.`);
                if (product.stock < item.quantity) throw new Error(`Product "${product.name}" is out of stock.`);

                const itemPrice = product.price * item.quantity;
                total += itemPrice;

                await OrderItem.create({
                    orderId: order.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    price: product.price
                }, { transaction: t });

                product.stock -= item.quantity;
                await product.save({ transaction: t });
            }

            order.totalPrice = total;
            await order.save({ transaction: t });

            return { orderId: order.id, total };
        });
    }

    async getOrdersByRole(userId, userRole, filters = {}) {
        const { limit = 50, offset = 0, status } = filters;
        let orderQuery = {
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']],
            where: {}
        };

        if (status && status !== 'all') orderQuery.where.status = status;
        if (userRole === 'customer') orderQuery.where.userId = userId;

        // Association structure for consistent loading
        const include = [
            { model: User, attributes: ['username', 'email'] },
            {
                model: OrderItem,
                required: true,
                include: [{ 
                    model: Product, 
                    include: [{ model: User, attributes: ['username'] }] 
                }]
            }
        ];

        if (userRole === 'seller') {
            // STEP 1: Get unique order IDs for this seller
            const sellerItems = await OrderItem.findAll({
                attributes: ['orderId'],
                include: [{ model: Product, where: { userId }, required: true, attributes: [] }],
                raw: true
            });
            const validIds = [...new Set(sellerItems.map(i => i.orderId))];
            if (validIds.length === 0) return { orders: [], total: 0 };

            const total = await Order.count({ where: { id: { [Op.in]: validIds }, ...orderQuery.where } });
            
            // STEP 2: Fetch orders
            const orders = await Order.findAll({
                where: { id: { [Op.in]: validIds }, ...orderQuery.where },
                include: [{ model: User, attributes: ['username', 'email'] }],
                attributes: ['id', 'totalPrice', 'status', 'createdAt', 'shippingAddress', 'city', 'phone', 'paymentMethod'],
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            // STEP 3: Fetch items for these specific orders that belong to the seller
            const formattedOrders = [];
            for (let orderInst of orders) {
                const order = orderInst.toJSON();
                const items = await OrderItem.findAll({
                    where: { orderId: order.id },
                    include: [{ 
                        model: Product, 
                        where: { userId }, 
                        required: true,
                        include: [{ model: User, attributes: ['username'] }] // Include seller name for completeness
                    }]
                });
                order.OrderItems = items;
                formattedOrders.push(order);
            }

            return { orders: formattedOrders, total };
        }

        // Admin/Customer Logic
        const { count, rows } = await Order.findAndCountAll({
            ...orderQuery,
            include,
            distinct: true,
            col: 'id'
        });

        return { orders: rows, total: count };
    }

    async getOrderStats(userId, userRole) {
        let stats = {
            totalRevenue: 0,
            pendingCount: 0,
            completedCount: 0,
            totalOrders: 0
        };

        if (userRole === 'admin') {
            stats.totalOrders = await Order.count();
            stats.pendingCount = await Order.count({ where: { status: 'pending' } });
            stats.completedCount = await Order.count({ where: { status: 'completed' } });
            stats.totalRevenue = await Order.sum('totalPrice') || 0;
        } else if (userRole === 'seller') {
            // Get all order items belonging to this seller
            const sellerItems = await OrderItem.findAll({
                include: [
                    { model: Product, where: { userId }, required: true, attributes: [] },
                    { model: Order, attributes: ['status', 'totalPrice'] }
                ],
            });

            const uniqueOrderIds = new Set();
            sellerItems.forEach(item => {
                const order = item.Order;
                if (!order) return;
                
                uniqueOrderIds.add(item.orderId);
                const itemRevenue = item.price * item.quantity;
                stats.totalRevenue += itemRevenue;

                // We count an order as 'pending' for a seller if the global status is pending
                // Note: This is an approximation. A better way would be tracking status per seller-order-link
            });

            // Re-fetch unique orders for accurate status counts
            const sellerOrders = await Order.findAll({
                where: { id: { [Op.in]: Array.from(uniqueOrderIds) } },
                attributes: ['status']
            });

            stats.totalOrders = sellerOrders.length;
            stats.pendingCount = sellerOrders.filter(o => o.status === 'pending').length;
            stats.completedCount = sellerOrders.filter(o => o.status === 'completed').length;
        }

        return stats;
    }

    async updateStatus(orderId, status, userId, userRole) {
        const order = await Order.findByPk(orderId);
        if (!order) throw new Error("Order not found");

        if (userRole !== 'admin') {
            if (userRole === 'seller') {
                const hasMyProduct = await OrderItem.findOne({
                    where: { orderId },
                    include: [{ model: Product, where: { userId }, required: true }]
                });
                if (!hasMyProduct) throw new Error("Unauthorized access to this order.");
            } else {
                throw new Error("Unauthorized");
            }
        }

        order.status = status;
        await order.save();
        return order;
    }
}

module.exports = new OrderService();
