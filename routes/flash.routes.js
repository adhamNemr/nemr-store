const express = require("express");
const router = express.Router();
const flashController = require("../controllers/flash.controller");

router.post("/", flashController.createFlash);
router.get("/", flashController.getAllFlash);

module.exports = router;