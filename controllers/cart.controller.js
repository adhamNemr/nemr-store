const Cart = require("../models/cart.model");
const Product = require("../models/product.model");

exports.addToCart = async (req, res) => {
    try {
    const { userId, productId, quantity } = req.body;

    if (!quantity || quantity <= 0) {
        return res.status(400).json({ error: "Quantity must be a positive number" });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
        return res.status(404).json({ error: "Product not found" });
    }

    if (quantity > 20) {
        return res.status(400).json({ error: "Maximum quantity allowed is 20 per item." });
    }

    const existingItem = await Cart.findOne({ where: { userId, productId } });

    if (existingItem) {
        existingItem.quantity += quantity;
        await existingItem.save();
        return res.json({ message: "Quantity updated", item: existingItem });
    }

    const newItem = await Cart.create({ userId, productId, quantity });
    res.status(201).json(newItem);
    } catch (err) {
    res.status(500).json({ error: "Something went wrong", details: err.message });
    }
};

exports.getCart = async (req, res) => {
    try {
    const userId = req.params.userId;

    const cartItems = await Cart.findAll({
        where: { userId },
        attributes: ["id", "quantity"],
        include: [
        {
            model: Product,
            attributes: ["id", "name", "price", "image"] // ممكن تزود لو محتاج
        }
        ]
    });

    res.json(cartItems);
    } catch (err) {
    res.status(500).json({ error: "Failed to fetch cart", details: err.message });
    }
};

// حذف عنصر من العربة
exports.removeFromCart = async (req, res) => {
try {
    const { id } = req.params;
    const item = await Cart.findByPk(id);
    if (!item) {
        return res.status(404).json({ error: "Item not found in cart" });
    }
    await item.destroy();
    res.json({ message: "Item removed from cart" });
} catch (err) {
    res.status(500).json({ error: "Failed to remove item", details: err.message });
}
};

// تفريغ العربة بالكامل
exports.clearCart = async (req, res) => {
try {
    const { userId } = req.params;
    const items = await Cart.findAll({ where: { userId } });
    if (items.length === 0) {
        return res.status(404).json({ message: "Cart is already empty" });
    }
    await Cart.destroy({ where: { userId } });
    res.json({ message: "Cart cleared" });
} catch (err) {
    res.status(500).json({ error: "Failed to clear cart", details: err.message });
}
};
// حساب إجمالي سعر العربة
exports.getCartTotal = async (req, res) => {
    try {
        const userId = req.params.userId;
        const cartItems = await Cart.findAll({
            where: { userId },
            include: [{ model: Product, attributes: ["price"] }]
        });

        const total = cartItems.reduce((acc, item) => {
            return acc + item.quantity * item.Product.price;
        }, 0);

        res.json({ total });
    } catch (err) {
        res.status(500).json({ error: "Failed to calculate cart total", details: err.message });
    }
};

exports.updateCartItem = async (req, res) => {
    try {
    const { quantity } = req.body;
    const { id } = req.params;

    const item = await Cart.findByPk(id);
    if (!item) return res.status(404).json({ error: "Item not found" });

    item.quantity = quantity;
    await item.save();
    res.json({ message: "Quantity updated", item });
    } catch (err) {
    res.status(500).json({ error: "Failed to update item", details: err.message });
    }
};

exports.getCartCount = async (req, res) => {
    try {
    const userId = req.params.userId;
    const count = await Cart.sum('quantity', { where: { userId } });
    res.json({ count });
    } catch (err) {
    res.status(500).json({ error: "Failed to get cart count", details: err.message });
    }
};