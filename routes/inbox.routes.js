const express = require("express");
const router = express.Router();
const { getConversations, sendMessage, getMessagesWithUser } = require("../controllers/inbox.Controller");
const verifyToken = require("../middleware/verifyToken");

router.use(verifyToken); // جميع المسارات تتطلب تسجيل دخول

router.get("/", getConversations);
router.post("/", sendMessage);
router.get("/:userId", getMessagesWithUser);

module.exports = router;