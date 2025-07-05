const Order = require("../models/order.model");
const Product = require("../models/product.model");
const User = require("../models/user.model");
const Payment = require("../models/payment.model");
const { Sequelize } = require("sequelize");

// Dashboard summary (Admin)
exports.getDashboardSummary = async (req, res) => {
  try {
    // عدد الطلبات
    const totalOrders = await Order.count();

    // إجمالي الإيرادات من الطلبات
    const totalRevenueResult = await Order.findAll({
      attributes: [[Sequelize.fn("SUM", Sequelize.col("totalPrice")), "totalRevenue"]],
      raw: true
    });
    const totalRevenue = totalRevenueResult[0].totalRevenue || 0;

    // عدد المنتجات
    const totalProducts = await Product.count();

    // عدد المستخدمين
    const totalUsers = await User.count();

    // إجمالي المدفوعات
    const totalPaymentsResult = await Payment.findAll({
      attributes: [[Sequelize.fn("SUM", Sequelize.col("payment_amount")), "paymentsTotal"]],
      raw: true
    });
    const paymentsTotal = totalPaymentsResult[0].paymentsTotal || 0;

    // إرسال البيانات للواجهة
    res.status(200).json({
      totalOrders,
      totalRevenue,
      totalProducts,
      totalUsers,
      paymentsTotal
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch dashboard data", details: err.message });
  }
};