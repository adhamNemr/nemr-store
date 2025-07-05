const express = require("express");
const router = express.Router();
const { getAllUsers } = require("../controllers/users.controller");
const verifyToken = require("../middleware/verifyToken");

router.get("/", verifyToken, getAllUsers);

module.exports = router;