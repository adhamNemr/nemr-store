const express = require("express");
const router = express.Router();
const { getDashboardSummary } = require("../controllers/dashboard.controller");
const verifyToken = require("../middleware/verifyToken");

router.get("/summary", verifyToken, getDashboardSummary);

module.exports = router;