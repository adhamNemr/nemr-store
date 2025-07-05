const { Sequelize, DataTypes } = require('sequelize');
const dbConfig = require('../config/db');

const User = require("./user.model");
const Product = require("./product.model");
const Order = require("./order.model");
const OrderItem = require("./orderItem.model");

User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Product, { foreignKey: "userId" });
Product.belongsTo(User, { foreignKey: "userId" });

Order.hasMany(OrderItem, { foreignKey: "orderId" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

Product.hasMany(OrderItem, { foreignKey: "productId" });
OrderItem.belongsTo(Product, { foreignKey: "productId" });

module.exports = {
    Sequelize,
    User,
    Product,
    Order,
    OrderItem,
};
