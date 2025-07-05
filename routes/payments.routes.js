const express =require("express");
const Router = express.Router();
const {createPayment, getAllPayments} = require("../controllers/payments.controller");
const router = require("./products.routes");
const verifyToken = require("../middleware/verifyToken");

router.post("./",verifyToken,createPayment);
router.get("./",verifyToken,getAllPayments);

module.exports = router