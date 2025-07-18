const express = require("express");
const router = express.Router();
const {register , login ,checkUser, getCurrentUser, updateProfile, changePassword} = require("../controllers/auth.controller");
const verifyToken = require("../middleware/verifyToken");

router.post("/register", register);
router.post("/login", login);
router.post("/check-user", checkUser);
router.get("/me", verifyToken, getCurrentUser);

// تحديث بيانات البروفايل (اسم المستخدم فقط في هذا المثال)
router.put("/update-profile", verifyToken, updateProfile);

// تغيير كلمة المرور
router.put("/change-password", verifyToken, changePassword);

module.exports = router;