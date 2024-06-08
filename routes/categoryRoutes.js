const express = require("express");
const router = express.Router();
const {
  createCategory,
  getCategories,
  getCategoryById,
  deleteCategory,
} = require("../controllers/categoryController");
const { admin, protect } = require("../middleware/authMiddleware");

// Kategoriyalarni yaratish
router.post("/category", protect, admin, createCategory);

// Barcha kategoriyalarni olish
router.get("/", getCategories);

// Id orqali kategoriyani olish
router.get("/:categoryId", getCategoryById);
router.delete("/:categoryId", protect, admin, deleteCategory);

module.exports = router;
