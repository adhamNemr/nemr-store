const productService = require("../services/product.service");

/**
 * NEMR STORE - PRODUCTS CONTROLLER
 * Refactored to follow Service Layer Architecture.
 */

exports.getAllProducts = async (req, res) => {
    try {
        const result = await productService.listProducts({
            ...req.query,
            userId: req.userId,
            userRole: req.userRole
        });
        
        const formatted = result.rows.map(p => ({
            ...p.get({ plain: true }),
            Seller: p.User ? { username: p.User.username } : null
        }));

        res.json({
            products: formatted,
            total: result.count,
            limit: parseInt(req.query.limit) || 50,
            offset: parseInt(req.query.offset) || 0
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to Fetch Products", details: err.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await productService.getProduct(req.params.id);
        if (!product) return res.status(404).json({ error: "Product Not Found" });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: "Failed To Fetch Product" });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const product = await productService.createProduct(req.body, req.userId);
        res.status(201).json({ message: "Product Created Successfully", product });
    } catch (err) {
        res.status(500).json({ error: "Failed To Create Product", details: err.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await productService.updateProduct(req.params.id, req.body, req.userId, req.userRole);
        res.json({ message: "Product updated successfully", product });
    } catch (err) {
        console.error(`[UpdateProductController] Error: ${err.message}`, err);
        res.status(errorStatus(err)).json({ error: err.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        await productService.deleteProduct(req.params.id, req.userId, req.userRole);
        res.json({ message: "Product deleted successfully" });
    } catch (err) {
        res.status(errorStatus(err)).json({ error: err.message });
    }
};

exports.toggleProductStatus = async (req, res) => {
    try {
        if (req.userRole !== 'admin') throw new Error("Unauthorized");
        const product = await productService.updateProduct(req.params.id, { status: req.body.status }, req.userId, req.userRole);
        res.json({ message: `Product status updated`, product });
    } catch (err) {
        res.status(403).json({ error: err.message });
    }
};

const errorStatus = (err) => {
    if (err.message === "Product not found") return 404;
    if (err.message === "Unauthorized") return 403;
    return 500;
};
