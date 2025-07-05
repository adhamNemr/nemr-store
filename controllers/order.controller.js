const { Model } = require("sequelize");
const { Order, OrderItem, Product } = require("../models");

exports.createOrder = async (req, res) => {
    const { userId, items } = req.body;
    if (!userId || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Invalid order data." });
    }
    try {
        const order = await Order.create({ userId });
        for (const item of items) {
            const product = await Product.findByPk(item.productId);
            if (!product) {
                return res.status(404).json({ error: `Product ID ${item.productId} not found.` });
            }
            await OrderItem.create({
                orderId: order.id,
                productId: item.productId,
                quantity: item.quantity,
                price: product.price
            });
        }
        res.status(201).json({ message: "Order created successfully", orderId: order.id });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getOrders = async (req,res) => {
    try{
        const orders = await Order.findAll({
            include:[{
                model : OrderItem,
                include :[Product]
                }
            ]
        });
        res.status(200).json({orders})
    }catch(error){
        console.error("Error Fetching Orders : ", error);
        res.status(500).json({error : "Internal Server Error"})
    }
};


exports.getOrderById = async (req,res) => {
    const {id} = req.params;
    try{
        const order = await Order.findByPk(id,{
            include: [{
                model : OrderItem,
                include : [Product]
            }]
        });
        if(!order){
            return res.status(404).json({error : "order not found"})
        };
        res.status(200).json({order});
    }catch(error){
        console.log("Error Fetching Order");
        res.status(500).json({error : "internal server error"});
    }
}