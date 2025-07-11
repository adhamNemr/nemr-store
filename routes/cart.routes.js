const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");

router.post("/", cartController.addToCart);
router.put("/:id", cartController.updateCartItem);
router.delete("/clear/:userId", cartController.clearCart);
router.delete("/:id", cartController.removeFromCart);
router.get("/total/:userId", cartController.getCartTotal);
router.get("/count/:userId", cartController.getCartCount);
router.get("/:userId", cartController.getCart);

module.exports = router;