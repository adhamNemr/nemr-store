const express = require("express");
const router = express.Router();
const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    toggleProductStatus
} = require("../controllers/products.controller");

const verifyToken = require("../middleware/verifyToken");

router.post("/", verifyToken, createProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.put("/:id", verifyToken, updateProduct);    
router.delete("/:id", verifyToken, deleteProduct); 
router.patch("/:id/status", verifyToken, toggleProductStatus);

module.exports = router;