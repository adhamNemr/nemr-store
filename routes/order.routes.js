const express = require("express");
const router = require("express").Router();

const { createOrder, getOrders, getOrderById, getMyOrders, getOrderStats, updateOrderStatus } = require("../controllers/order.controller");
const verifyToken = require("../middleware/verifyToken");

router.use(verifyToken);

router.post("/", createOrder);
router.get("/stats", getOrderStats);
router.get("/my-orders", getMyOrders); // MUST be before /:id
router.get("/", getOrders);
router.get("/:id", getOrderById);
router.put("/:id/status", updateOrderStatus);


module.exports = router;