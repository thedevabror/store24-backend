const Brand = require("../models/brandModel");

// Brand yaratish
const createBrand = async (req, res) => {
  try {
    const { name } = req.body;

    const newBrand = new Brand({ name });
    const savedBrand = await newBrand.save();

    res.status(201).json(savedBrand);
  } catch (error) {
    console.error("Error creating brand:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find();
    res.status(200).json(brands);
  } catch (error) {
    console.error("Error getting brands:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const getProductsByBrand = async (req, res) => {
  try {
    const brandId = req.params.brandId;
    const products = await Product.find({ brand: brandId });

    if (!products) {
      return res.status(404).json({ message: "Products not found" });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error("Error getting products by brand:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  createBrand,
  getAllBrands,
  getProductsByBrand,
};
