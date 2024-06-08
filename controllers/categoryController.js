const Category = require("../models/categoryModel.js");
const mongoose = require('mongoose');

// Kategoriya yaratish
const createCategory = async (req, res) => {
  const { name, parent } = req.body;

  try {
    const category = new Category({
      name,
      parent: parent || null,
    });

    await category.save();
    res.status(201).json({ message: "Category created", category });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Barcha kategoriyalarni olish
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate("parent");
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Kategoriya ID asosida olish
const getCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    console.log(`Fetching category with ID: ${categoryId}`); // Logging

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: "Invalid category ID format" });
    }

    const category = await Category.findById(categoryId).populate("parent");
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category);
  } catch (error) {
    console.error("Error fetching category:", error); // Error logging
    res.status(500).json({ message: "Server error", error });
  }
};

// Kategoriya o'chirish
const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: "Invalid category ID format" });
    }

    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted" });
  } catch (error) {
    console.error("Error deleting category:", error); // Error logging
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = { createCategory, getCategories, getCategoryById, deleteCategory };
