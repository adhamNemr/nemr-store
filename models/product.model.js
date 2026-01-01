const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Product = sequelize.define("Product", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    index: true // Faster searching
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  discountPrice: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false
  },
  image: {
    type: DataTypes.STRING, 
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  size: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  condition: {
    type: DataTypes.ENUM("new", "used"),
    defaultValue: "used",
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("active", "inactive", "suspended"),
    defaultValue: "active"
  },
  allowDiscounts: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  images: {
    type: DataTypes.JSON, 
    defaultValue: [] 
  }
});


module.exports = Product