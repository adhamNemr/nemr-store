const { Order, OrderItem, Product, User, sequelize } = require("../models");
const { Op } = require("sequelize");

class DashboardService {
    async getGlobalStats(userId, userRole, days = 30) {
        let totalRevenue = 0;
        let totalOrders = 0;
        let totalProducts = 0;
        let aov = 0;

        const start = new Date();
        start.setDate(start.getDate() - days);

        if (userRole === 'admin') {
            totalOrders = await Order.count({ where: { createdAt: { [Op.gte]: start } } });
            const revenueResult = await Order.sum('totalPrice', { where: { createdAt: { [Op.gte]: start } } });
            totalRevenue = revenueResult || 0;
            totalProducts = await Product.count();
        } else {
            // Seller Logic
            totalProducts = await Product.count({ where: { userId } });
            
            // Get seller revenue
            const revenueData = await OrderItem.findOne({
                attributes: [[sequelize.literal('SUM(OrderItem.quantity * OrderItem.price)'), 'revenue']],
                include: [
                    { model: Product, where: { userId }, attributes: [] },
                    { model: Order, where: { createdAt: { [Op.gte]: start } }, attributes: [] }
                ],
                raw: true
            });
            totalRevenue = revenueData ? (revenueData.revenue || 0) : 0;
            
            // Get unique order count for seller
            const sellerOrders = await OrderItem.findAll({
                attributes: [[sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('OrderItem.orderId'))), 'count']],
                include: [
                    { model: Product, where: { userId }, attributes: [] },
                    { model: Order, where: { createdAt: { [Op.gte]: start } }, attributes: [] }
                ],
                raw: true
            });
            totalOrders = sellerOrders[0] ? (sellerOrders[0].count || 0) : 0;
        }

        if (totalOrders > 0) aov = Math.round(totalRevenue / totalOrders);

        return { revenue: totalRevenue, orders: totalOrders, products: totalProducts, aov: aov };
    }

    async getSalesChartData(userId, userRole, days = 30) {
        const start = new Date();
        start.setDate(start.getDate() - days + 1); // Start from 'days' ago inclusive
        start.setHours(0, 0, 0, 0);

        let dbResults = [];

        if (userRole === 'admin') {
            const dateAttr = sequelize.fn('date', sequelize.col('Order.createdAt'));
            dbResults = await Order.findAll({
                where: { createdAt: { [Op.gte]: start } },
                attributes: [
                    [dateAttr, 'date'], 
                    [sequelize.fn('SUM', sequelize.col('totalPrice')), 'sales']
                ],
                group: [dateAttr],
                order: [[dateAttr, 'ASC']],
                raw: true
            });
        } else {
            const dateAttr = sequelize.fn('date', sequelize.col('OrderItem.createdAt'));
            dbResults = await OrderItem.findAll({
                attributes: [
                    [dateAttr, 'date'],
                    [sequelize.fn('SUM', sequelize.literal('OrderItem.quantity * OrderItem.price')), 'sales']
                ],
                include: [
                    { model: Product, where: { userId }, attributes: [] },
                    { model: Order, where: { createdAt: { [Op.gte]: start } }, attributes: [] }
                ],
                group: [dateAttr],
                order: [[dateAttr, 'ASC']],
                raw: true
            });
        }

        // Map DB results for easy access
        const dataMap = {};
        dbResults.forEach(row => {
            dataMap[row.date] = Number(row.sales);
        });

        // Generate full timeframe with 0 for missing days
        const chartData = [];
        for (let i = 0; i < days; i++) {
            const current = new Date(start);
            current.setDate(start.getDate() + i);
            const dateStr = current.toISOString().split('T')[0];
            
            chartData.push({
                name: dateStr,
                sales: dataMap[dateStr] || 0
            });
        }

        return chartData;
    }

    async getCustomers(userId, userRole, query, limit, offset) {
        let customersData = [];
        let totalCount = 0;

        let whereClause = { role: 'customer' };
        if (query) {
            whereClause[Op.or] = [
                { username: { [Op.like]: `%${query}%` } },
                { email: { [Op.like]: `%${query}%` } }
            ];
        }

        if (userRole === 'admin') {
            const { count, rows } = await User.findAndCountAll({
                where: whereClause,
                attributes: ['id', 'username', 'email', 'createdAt'],
                include: [{ model: Order, attributes: ['id', 'totalPrice', 'createdAt'] }],
                limit: parseInt(limit),
                offset: parseInt(offset),
                distinct: true
            });
            customersData = rows;
            totalCount = count;
        } else {
            // Complex seller-specific aggregation logic moved here
            const myOrderItems = await OrderItem.findAll({
                include: [
                    { model: Product, where: { userId }, attributes: [] },
                    { model: Order, include: [{ model: User, attributes: ['id', 'username', 'email', 'createdAt'] }], attributes: ['id', 'createdAt'] }
                ]
            });

            const userMap = {};
            myOrderItems.forEach(item => {
                const order = item.Order;
                if (!order || !order.User) return;
                const u = order.User;
                const spend = item.price * item.quantity;
                
                if (query) {
                    const qLower = query.toLowerCase();
                    if (!u.username?.toLowerCase().includes(qLower) && !u.email?.toLowerCase().includes(qLower)) return;
                }
                
                if (!userMap[u.id]) {
                    userMap[u.id] = { id: u.id, name: u.username, email: u.email, joinedAt: u.createdAt, orders: new Set(), totalSpent: 0, lastOrderDate: order.createdAt };
                }
                userMap[u.id].totalSpent += spend;
                userMap[u.id].orders.add(order.id);
                if (new Date(order.createdAt) > new Date(userMap[u.id].lastOrderDate)) userMap[u.id].lastOrderDate = order.createdAt;
            });
            
            customersData = Object.values(userMap);
            totalCount = customersData.length;
            customersData = customersData.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
        }

        return { customers: customersData, total: totalCount };
    }
}

module.exports = new DashboardService();
