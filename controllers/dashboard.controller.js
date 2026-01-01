const { Order, OrderItem, Product, User, Cart, Coupon, Setting, sequelize } = require("../models");
const { Op } = require("sequelize");
const dashboardService = require("../services/dashboard.service");

/**
 * NEMR STORE - DASHBOARD CONTROLLER
 * Fully Refactored for Clean Architecture & Performance.
 */

exports.getStats = async (req, res) => {
    try {
        const { days = 30 } = req.query;
        console.log(`[Dashboard] Fetching Stats for ${days} days`);
        const stats = await dashboardService.getGlobalStats(req.userId, req.userRole, parseInt(days));
        res.json(stats);
    } catch (err) {
        console.error("Stats Error:", err);
        res.status(500).json({ error: "Failed to fetch stats" });
    }
};

exports.getSalesChart = async (req, res) => {
    try {
        const { days = 30 } = req.query;
        console.log(`[Dashboard] Fetching Sales Chart for ${days} days`);
        const salesData = await dashboardService.getSalesChartData(req.userId, req.userRole, parseInt(days));
        res.json(salesData);
    } catch (err) {
        console.error("Sales Chart Error:", err);
        res.status(500).json({ error: "Failed to fetch sales chart" });
    }
};

exports.getCustomers = async (req, res) => {
    try {
        const { limit = 10, offset = 0, q } = req.query;
        const result = await dashboardService.getCustomers(req.userId, req.userRole, q, limit, offset);

        const formatted = result.customers.map(c => ({
            id: c.id,
            name: c.name || c.username,
            email: c.email,
            joinedAt: c.joinedAt || c.createdAt,
            totalSpent: Math.round(c.totalSpent || 0),
            orderCount: c.orders?.size || c.Orders?.length || 0,
            lastOrderDate: c.lastOrderDate || (c.Orders?.[0]?.createdAt)
        }));

        res.json({ customers: formatted, total: result.total, limit: parseInt(limit), offset: parseInt(offset) });
    } catch (err) {
        console.error("Customers Error:", err);
        res.status(500).json({ error: "Failed to fetch customers" });
    }
};

exports.getCategoryStats = async (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        let whereClause = {};
        if (userRole === 'seller') whereClause.userId = userId;

        const categoryStats = await Product.findAll({
            where: whereClause,
            attributes: ['category', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
            group: ['category'],
        });

        res.json(categoryStats.map(s => ({ name: s.category || 'Uncategorized', value: s.dataValues.count })));
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch category stats" });
    }
};

exports.getProductAnalytics = async (req, res) => {
    try {
        const { days = 30 } = req.query;
        console.log(`[Dashboard] Fetching Product Analytics for ${days} days`);
        const userId = req.userId;
        const userRole = req.userRole;
        
        const start = new Date();
        start.setDate(start.getDate() - parseInt(days));
        const startDateStr = start.toISOString().replace('T', ' ').replace('Z', ''); // SQLite friendly

        let whereClause = {};
        if (userRole === 'seller') whereClause.userId = userId;

        const products = await Product.findAll({
            where: whereClause,
            attributes: ['id', 'name', 'price', 'image', 'views', 'category'],
            attributes: {
                include: [
                    // Count unique users who have this in their active carts
                    [sequelize.literal(`(
                        SELECT COUNT(*) FROM Carts WHERE Carts.productId = Product.id
                    )`), 'inCarts'],
                    // Total UNITS sold in period
                    [sequelize.literal(`(
                        SELECT SUM(quantity) FROM OrderItems 
                        JOIN Orders ON OrderItems.orderId = Orders.id 
                        WHERE OrderItems.productId = Product.id 
                        AND Orders.createdAt >= '${startDateStr}'
                    )`), 'totalSold'],
                    // Total REVENUE in period
                    [sequelize.literal(`(
                        SELECT SUM(quantity * price) FROM OrderItems 
                        JOIN Orders ON OrderItems.orderId = Orders.id 
                        WHERE OrderItems.productId = Product.id 
                        AND Orders.createdAt >= '${startDateStr}'
                    )`), 'totalRevenue']
                ]
            },
            group: ['Product.id']
        });

        const formatted = products.map(p => {
            const views = p.views || 0;
            const sold = Number(p.dataValues.totalSold) || 0;
            // Conversion is (units sold this period / all-time views) * 100
            // NOTE: Views are currently all-time as they aren't tracked by date
            const conversionRate = views > 0 ? ((sold / views) * 100).toFixed(1) : 0;
            
            return {
                id: p.id, 
                name: p.name, 
                image: p.image, 
                price: p.price, 
                views: views,
                inCarts: p.dataValues.inCarts || 0, 
                sold: sold, 
                revenue: Number(p.dataValues.totalRevenue) || 0,
                conversionRate: conversionRate
            };
        });

        res.json(formatted.sort((a,b) => b.sold - a.sold));
    } catch (err) {
        console.error("Product Analytics Error:", err);
        res.status(500).json({ error: "Failed to fetch product analytics" });
    }
};

exports.getCustomerDetails = async (req, res) => {
    try {
        const customer = await User.findByPk(req.params.id, {
            attributes: ['id', 'username', 'email', 'createdAt'],
            include: [{ model: Order, attributes: ['id', 'totalPrice', 'status', 'createdAt'] }]
        });
        if (!customer) return res.status(404).json({ error: "Customer not found" });
        res.json(customer);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch customer details" });
    }
};

exports.getSellers = async (req, res) => {
    try {
        if (req.userRole !== 'admin') return res.status(403).json({ error: "Unauthorized" });
        const sellers = await User.findAll({
            where: { role: 'seller' },
            attributes: ['id', 'username', 'email', 'createdAt'],
            include: [{ model: Product, attributes: ['id'] }]
        });
        res.json(sellers);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch sellers" });
    }
};

exports.getTopProducts = async (req, res) => exports.getProductAnalytics(req, res);

exports.getCoupons = async (req, res) => {
    try {
        const whereClause = req.userRole === 'seller' ? { sellerId: req.userId } : {};
        const coupons = await Coupon.findAll({ where: whereClause, order: [['createdAt', 'DESC']] });
        res.json(coupons);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch coupons" });
    }
};

exports.createCoupon = async (req, res) => {
    try {
        const { code, discountType, value, expirationDate, usageLimit } = req.body;
        const sellerId = req.userRole === 'seller' ? req.userId : null;
        const newCoupon = await Coupon.create({ code: code.toUpperCase(), discountType, value, expirationDate, usageLimit, sellerId });
        res.status(201).json(newCoupon);
    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') return res.status(400).json({ error: "Coupon code already exists" });
        res.status(500).json({ error: "Failed to create coupon" });
    }
};

exports.deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByPk(req.params.id);
        if (!coupon) return res.status(404).json({ error: "Coupon not found" });
        if (req.userRole !== 'admin' && coupon.sellerId !== req.userId) return res.status(403).json({ error: "Unauthorized" });
        await coupon.destroy();
        res.json({ message: "Coupon deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete coupon" });
    }
};

exports.updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByPk(req.params.id);
        if (!coupon) return res.status(404).json({ error: "Coupon not found" });
        
        // Authorization Check
        if (req.userRole !== 'admin' && coupon.sellerId !== req.userId) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        const { code, discountType, value, expirationDate, usageLimit, isActive, minOrderValue, onePerUser } = req.body;

        await coupon.update({
            code: code ? code.toUpperCase() : coupon.code,
            discountType, 
            value, 
            expirationDate, 
            usageLimit, 
            isActive,
            minOrderValue,
            onePerUser
        });

        res.json(coupon);
    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') return res.status(400).json({ error: "Coupon code already exists" });
        res.status(500).json({ error: "Failed to update coupon" });
    }
};

exports.getSettings = async (req, res) => {
    try {
        let settings = await Setting.findAll();
        if (settings.length === 0) {
            settings = await Setting.bulkCreate([
                { key: 'marketplace_name', value: 'NEMR STORE', label: 'Marketplace Name' },
                { key: 'contact_email', value: 'support@nemr.store', label: 'Contact Email' },
                { key: 'announcement_bar', value: 'Free Shipping on orders over 2000 EGP!', label: 'Announcement Bar' }
            ]);
        }
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch settings" });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        if (req.userRole !== 'admin') return res.status(403).json({ error: "Unauthorized" });
        for (const up of req.body) {
            await Setting.update({ value: up.value }, { where: { key: up.key } });
        }
        res.json({ message: "Settings updated successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to update settings" });
    }
};