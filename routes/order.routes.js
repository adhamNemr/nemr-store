const express = require("express");
const router = require("express").Router();

const { createOrder, getOrders,getOrderById } = require("../controllers/order.controller");

router.post("/", createOrder);
router.get("/", getOrders);
router.get("/:id", getOrderById);

module.exports = router;