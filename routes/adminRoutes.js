const express = require("express");
const multer = require("multer");
const path = require("path");
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

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "images/"); // Fayllarni saqlash joyi
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    ); // Fayl nomi
  },
});

const upload = multer({ storage });

router.post("/products", upload.single("image"), createProduct);

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

// CRUD routes for products
router.route("/products").get(protect, admin, getProducts);

router
  .route("/products/:id")
  .get(protect, admin, getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

router.get("/top-selling-products", protect, admin, getTopSellingProducts);

router.get("/users", protect, admin, getAllUsers);
router.put("/:id/status", protect, admin, blockUnBlockUser);

module.exports = router;
