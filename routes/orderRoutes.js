const express = require("express");
const { createOrder, getUserOrders, updateOrderStatus } = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

// Foydalanuvchi buyurtma yaratishi
router.post("/:userId", protect, createOrder);
router.get("/:userId", protect, getUserOrders);
router.put('/update-order-status', updateOrderStatus);

module.exports = router;
