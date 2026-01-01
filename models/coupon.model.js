const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Coupon = sequelize.define("Coupon", {
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  discountType: {
    type: DataTypes.ENUM('percentage', 'fixed'),
    defaultValue: 'percentage'
  },
  value: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  expirationDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  usageLimit: {
    type: DataTypes.INTEGER,
    defaultValue: 100
  },
  usedCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  sellerId: {
    type: DataTypes.INTEGER,
    allowNull: true // Null means global admin coupon
  },
  minOrderValue: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0
  },
  onePerUser: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = Coupon;
