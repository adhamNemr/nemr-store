const Payment = require("../models/payment.model");

exports.createPayments = async (req,res) => {
    const {orderId , paymentMethod , paymentAmount} = req.body;
    if(!orderId || !paymentMethod || !paymentAmount){
        return res.status(400).json({error : "all fields are require"})
    }
    try{
        const payment = await Payment.create({
            orderId,
            paymentMethod,
            paymentAmount
        })
        res.status(201).json({message : "Payment Recorded", payment})
    }catch(err){
        res.status(500).json({error : "failed to create payment", details : err.message});
    }
};

exports.getAllPayments = async (req,res) => {
    try{
        const payments = await Payment.findAll();
        res.status(200).json({payments});
    }catch(err){
        return res.status(500).json({error : "Faild Fetching Payments",details : err.message});
    }
}