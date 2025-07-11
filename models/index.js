const { Sequelize, DataTypes } = require('sequelize');
const dbConfig = require('../config/db');

const User = require("./user.model");
const Product = require("./product.model");
const Order = require("./order.model");
const OrderItem = require("./orderItem.model");
const Cart = require('./cart.model');
const Category = require("./category.model");
const Brand = require("./brand.model");

User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Product, { foreignKey: "userId" });
Product.belongsTo(User, { foreignKey: "userId" });

Order.hasMany(OrderItem, { foreignKey: "orderId" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

Product.hasMany(OrderItem, { foreignKey: "productId" });
OrderItem.belongsTo(Product, { foreignKey: "productId" });

Cart.belongsTo(Product, { foreignKey: "productId" });

// Cart relations
User.hasMany(Cart, { foreignKey: "userId" });
Cart.belongsTo(User, { foreignKey: "userId" });

// Product relations
Category.hasMany(Product, { foreignKey: "categoryId" });
Product.belongsTo(Category, { foreignKey: "categoryId" });

Brand.hasMany(Product, { foreignKey: "brandId" });
Product.belongsTo(Brand, { foreignKey: "brandId" });

module.exports = {
    Sequelize,
    User,
    Product,
    Order,
    OrderItem,
    Cart,
    Category,
    Brand
};
