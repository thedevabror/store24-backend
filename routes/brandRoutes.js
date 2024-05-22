// routes/brandRoutes.js
const express = require("express");
const router = express.Router();
const {
  createBrand,
  getAllBrands,
  getProductsByBrand,
} = require("../controllers/brandController");
const { protect, admin } = require("../middleware/authMiddleware");

// Brend yaratish
router.post("/", protect, admin, createBrand);

// Barcha brendlarni olish
router.get("/", getAllBrands);

// Ma'lum bir brendga tegishli mahsulotlarni olish
router.get("/:brandId/products", getProductsByBrand);

module.exports = router;
