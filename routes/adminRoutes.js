const express = require("express");
const {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProductById,
  registerAdmin,
  loginAdmin,
  getTopSellingProducts,
  getAllUsers,
  blockUnBlockUser,
} = require("../controllers/adminController");
const { protect, admin } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload an image."), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
}).array("images", 10);

const router = express.Router();

router.post("/products", protect, admin, upload, createProduct);

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

// CRUD routes for products
router.route("/products").get(protect, admin, getProducts);

router
  .route("/products/:id")
  .get(protect, admin, getProductById)
  .put(protect, admin, upload, updateProduct)
  .delete(protect, admin, deleteProduct);

router.get("/top-selling-products", protect, admin, getTopSellingProducts);

router.get("/users", protect, admin, getAllUsers);
router.put("/:id/status", protect, admin, blockUnBlockUser);

module.exports = router;
