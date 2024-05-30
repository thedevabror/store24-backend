const express = require("express");
const {
  createOrder,
  getUserOrders,
  updateOrderStatus,
  getAllOrders,
  getOrderById,
} = require("../controllers/orderController");
const { protect, admin } = require("../middleware/authMiddleware");
const router = express.Router();

// Foydalanuvchi buyurtma yaratishi
router.post("/:userId", protect, createOrder);
router.get("/:userId", protect, getUserOrders);
router.get("/details/:orderId", protect, getOrderById);
router.get("/", protect, admin, getAllOrders);
router.put("/update-order-status", protect, admin, updateOrderStatus);

module.exports = router;
