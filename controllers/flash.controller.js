const FlashSale = require("../models/flash.model");

exports.createFlash = async (req, res) => {
  try {
    const { name, image, oldPrice, newPrice, endTime } = req.body;
    const flashItem = await FlashSale.create({
      name,
      image,
      oldPrice,
      newPrice,
      endTime,
    });
    res.status(201).json(flashItem);
  } catch (err) {
    res.status(500).json({ error: "Failed to create flash sale", details: err.message });
  }
};

exports.getAllFlash = async (req, res) => {
  try {
    const flashItems = await FlashSale.findAll();
    res.status(200).json(flashItems);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch flash sale items", details: err.message });
  }
};