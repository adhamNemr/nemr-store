const orderService = require("../services/order.service");

/**
 * NEMR STORE - ORDER CONTROLLER
 * Clean Architecture Implementation using Service Layer.
 */

exports.createOrder = async (req, res) => {
    try {
        const { items } = req.body;
        const result = await orderService.createOrder(req.user?.id || req.userId, items);
        res.status(201).json({ success: true, ...result });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const { limit = 50, offset = 0, status } = req.query;
        const result = await orderService.getOrdersByRole(req.userId, req.userRole, { limit, offset, status });

        const formatted = result.orders.map(order => ({
            id: order.id,
            total: order.totalPrice,
            status: order.status,
            createdAt: order.createdAt,
            shippingAddress: order.shippingAddress,
            city: order.city,
            phone: order.phone,
            paymentMethod: order.paymentMethod,
            customer: order.User?.username || 'Guest',
            email: order.User?.email,
            itemCount: order.OrderItems?.length || 0,
            items: order.OrderItems?.map(item => ({
                productName: item.Product?.name,
                quantity: item.quantity,
                price: item.price,
                seller: item.Product?.User?.username
            }))
        }));

        res.json({ orders: formatted, total: result.total, limit, offset });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch orders" });
    }
};

exports.getOrderStats = async (req, res) => {
    try {
        const stats = await orderService.getOrderStats(req.userId, req.userRole);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch top-level stats" });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const order = await orderService.updateStatus(req.params.id, req.body.status, req.userId, req.userRole);
        res.json({ success: true, message: "Order status updated", order });
    } catch (error) {
        res.status(403).json({ success: false, error: error.message });
    }
};

// Legacy support for basic GET
exports.getOrders = async (req, res) => exports.getMyOrders(req, res);
exports.getOrderById = async (req, res) => {
    try {
        const { limit = 1, offset = 0 } = req.query;
        const result = await orderService.getOrdersByRole(req.userId, 'customer', { limit, offset });
        const order = result.orders.find(o => o.id == req.params.id);
        if (!order) return res.status(404).json({ success: false, error: "Order not found" });
        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, error: "Internal error" });
    }
};