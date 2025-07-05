const Product = require("../models/product.model");

exports.getAllProducts = async (req,res) => {
    try{
        const Products = await Product.findAll();
        res.json(Products);    
    }catch(err){
        res.status(500).json({error : "Faild to Fetch Products", details : err.message});
    }
};

exports.getProductById = async (req,res) => {
    const {id} = req.params;
    try{
        const Product = await Product.findByPk(id);
        if(!Product){
            return res.status(404).json({error : "Product Not Found"});
        }
        res.json(Product)
    }catch(err){
        res.status(500).json({error : "Failed To Fetch Product", details : err.message});
    }
}

exports.createProduct = async (req,res) => {
    const {name , price , stock } = req.body;
    if(!name || !price || !stock){
        return res.status(400).json({error : "All fields are Required"});
    }
    try{
        const newProduct = await Product.create({name,price,stock});
        res.status(201).json({message : "Product Create Successfully", Product : newProduct});
    }catch(err){
        res.status(500).json({error : "Failed To Create a Product",details : err.message});
    }
    
}

exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, price, stock } = req.body;

    try {
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        product.name = name || product.name;
        product.price = price || product.price;
        product.stock = stock || product.stock;

        await product.save();

        res.json({ message: "Product updated successfully", product });
    } catch (err) {
        res.status(500).json({ error: "Failed to update product", details: err.message });
    }
};

exports.deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        await product.destroy();

        res.json({ message: "Product deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete product", details: err.message });
    }
};

