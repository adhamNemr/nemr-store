// controllers/brand.controller.js
const Brand = require("../models/brand.model");

exports.createBrand = async (req, res) => {
  try {
    const { name, image } = req.body;
    const newBrand = await Brand.create({ name, image });
    res.status(201).json(newBrand);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong", details: err.message });
  }
};

exports.getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.findAll();
    res.status(200).json(brands);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch brands", details: err.message });
  }
};