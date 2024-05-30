const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");

const createOrder = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.cart.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let totalPrice = 0;
    for (let item of user.cart) {
      const product = await Product.findById(item.productId);
      if (product) {
        totalPrice += item.quantity * product.price;
      } else {
        return res
          .status(404)
          .json({ message: `Product with ID ${item.productId} not found` });
      }
    }

    const order = new Order({
      userId: user._id,
      products: user.cart,
      totalPrice,
    });

    await order.save();

    user.cart = [];
    await user.save();

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    console.log(`Fetching order with ID: ${orderId}`);

    const order = await Order.findById(orderId).populate("products.productId");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    console.log("Populated order:", order);

    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const userId = req.params.userId;

    const orders = await Order.find({ userId }).populate("products.productId");

    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    const order = await Order.findByIdAndDelete(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  getAllOrders,
  deleteOrder,
};
