const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("User", {
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM("admin", "seller", "customer"),
    defaultValue: "customer"
  },
  status: {
    type: DataTypes.ENUM("active", "banned", "suspended"),
    defaultValue: "active"
  }
});

module.exports = User;