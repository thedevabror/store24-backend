const Product = require("../models/productModel");
const User = require("../models/userModel");
const Order = require("../models/orderModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isAdmin: true,
    });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
      address: user.address,
      cart: user.cart,
      isActive: user.isActive,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
        address: user.address,
        cart: user.cart,
        isActive: user.isActive,
        isAdmin: user.isAdmin,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new product
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      countInStock,
      category,
      brand,
      color,
      attributes,
    } = req.body;
    const images = req.files ? req.files.map((file) => file.path) : []; // Yuklangan fayl nomini olish

    const product = new Product({
      name,
      description,
      price,
      countInStock,
      images, // Rasm manzilini saqlash
      category,
      brand,
      color,
      attributes,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.log(error);
    console.log(error);
    res.status(400).json({ message: "Product creation failed", error });
  }
};

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products", error });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch product", error });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.name = req.body.name || product.name;
      product.description = req.body.description || product.description;
      product.price = req.body.price || product.price;
      product.countInStock = req.body.countInStock || product.countInStock;
      product.image = req.body.image || product.image;
      product.category = req.body.category || product.category;
      product.brand = req.body.brand || product.brand;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Product update failed", error });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    product.images.forEach((image) => {
      const filePath = path.join(
        __dirname,
        "..",
        image.replace("uploads/", "")
      );
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Failed to delete image file: ${filePath}`, err);
        } else {
          console.log(`Successfully deleted image file: ${filePath}`);
        }
      });
    });
    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const getTopSellingProducts = async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
    ]);

    res.status(200).json(topProducts);
  } catch (error) {
    console.error("Error fetching top selling products:", error); // Xatoni konsolga chiqarish
    res.status(500).json({ message: "Server error", error });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const blockUnBlockUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

module.exports = {
  registerAdmin,
  loginAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProductById,
  getTopSellingProducts,
  getAllUsers,
  blockUnBlockUser,
};
