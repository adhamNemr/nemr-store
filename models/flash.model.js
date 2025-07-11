const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const FlashSale = sequelize.define("FlashSale", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  oldPrice: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  newPrice: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

module.exports = FlashSale;