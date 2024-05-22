const express = require("express");
const {
  registerUser,
  authUser,
  addToCart,
  getCartItems,
  getUserById,
  updateAddress,
  removeFromCart,
  deleteAccount,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", authUser);
router.get("/:id", protect, getUserById);
router.post("/:userId/cart", protect, addToCart);
router.get("/:id/cart", protect, getCartItems);
router.put("/:userId/address", protect, updateAddress);
router.delete("/:userId/cart/:productId", removeFromCart);
router.delete("/:id", deleteAccount);
router.post("/forgot-password", forgotPassword);
router.post('/reset/:token', resetPassword);
router.put('/:id/profileImage', upload.single('profileImage'))


module.exports = router;
