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

// User creates an order
router.post("/:userId", protect, createOrder);

// Get orders of a user
router.get("/:userId", protect, getUserOrders);

// Get details of a single order
router.get("/details/:orderId", protect, getOrderById);

// Admin retrieves all orders
router.get("/", protect, admin, getAllOrders);

// Admin updates order status
router.put("/update-order-status", protect, admin, updateOrderStatus);

module.exports = router;
