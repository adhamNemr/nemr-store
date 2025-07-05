const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Order = require("./order.model");

const Payment = sequelize.define("Payment", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "order_id"
    },
    paymentMethod: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: "payment_method"
    },
    paymentAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: "payment_amount"
    },
    paymentDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: "payment_date"
    }
    }, {
    tableName: "payments",
    timestamps: false
});

Payment.belongsTo(Order, { foreignKey: "orderId" });

module.exports = Payment;