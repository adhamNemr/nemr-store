const express = require("express");
const router = express.Router();
const brandController = require("../controllers/brand.controller");

router.post("/", brandController.createBrand);
router.get("/", brandController.getAllBrands);

module.exports = router;
