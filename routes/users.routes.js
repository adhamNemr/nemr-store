const express = require("express");
const router = express.Router();
const { getAllUsers, getUserById, updateUserStatus } = require("../controllers/users.controller");
const verifyToken = require("../middleware/verifyToken");

router.get("/", verifyToken, getAllUsers);
router.get("/:id", verifyToken, getUserById);
router.patch("/:id/status", verifyToken, updateUserStatus);

module.exports = router;