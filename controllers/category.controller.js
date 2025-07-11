const Category = require("../models/category.model");

exports.createCategory = async (req, res) => {
  try {
    const { name, image } = req.body;
    const newCategory = await Category.create({ name, image });
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong", details: err.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories", details: err.message });
  }
};