const Product = require("../models/productModel");

// Mahsulot yaratish
const createProduct = async (req, res) => {
  const {
    name,
    description,
    price,
    category,
    color,
    attributes,
    brand,
    stock,
  } = req.body;
  const images = req.files ? req.files.map((file) => file.path) : [];
  try {
    const newProduct = new Product({
      name,
      description,
      price,
      images,
      category,
      color,
      attributes,
      brand,
      stock,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error });
  }
};

const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const {
      name,
      description,
      price,
      category,
      color,
      attributes,
      brand,
      stock,
    } = req.body;

    // Parse attributes if they are sent as a JSON string
    const parsedAttributes = JSON.parse(attributes);

    // Handle file uploads
    const images = req.files.map((file) => file.filename);

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        name,
        description,
        price,
        images,
        category,
        color,
        attributes: parsedAttributes,
        brand,
        stock,
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Barcha mahsulotlarni olish
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ID orqali mahsulot olish
const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id).populate("category");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ID orqali mahsulotni o'chirish
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
