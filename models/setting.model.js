const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Setting = sequelize.define("Setting", {
  key: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  label: {
    type: DataTypes.STRING
  },
  type: {
     type: DataTypes.STRING,
     defaultValue: 'text' // text, boolean, number
  }
});

module.exports = Setting;
