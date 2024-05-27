const express = require("express");
const { createOrder, getUserOrders, updateOrderStatus, getAllOrders } = require("../controllers/orderController");
const { protect, admin } = require("../middleware/authMiddleware");
const router = express.Router();

// Foydalanuvchi buyurtma yaratishi
router.post("/:userId", protect, createOrder);
router.get("/:userId", protect, getUserOrders);
router.get("/", protect, admin, getAllOrders);
router.put('/update-order-status', updateOrderStatus);

module.exports = router;
