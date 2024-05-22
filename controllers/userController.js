const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashedPassword });
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

const authUser = async (req, res) => {
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

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const addToCart = async (req, res) => {
  const { userId } = req.params;
  const { productId, quantity } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Savatchada mahsulot mavjudligini tekshirish
    const cartItemIndex = user.cart.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (cartItemIndex > -1) {
      // Agar mahsulot savatchada mavjud bo'lsa, miqdorni yangilang
      user.cart[cartItemIndex].quantity += quantity;
    } else {
      // Yangi mahsulotni savatchaga qo'shish
      user.cart.push({ productId, quantity });
    }

    await user.save();
    res.status(200).json({ message: "Product added to cart", cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const userId = req.params.userId;
    const productId = req.params.productId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.cart = user.cart.filter(
      (item) => item.productId.toString() !== productId
    );

    await user.save();
    res
      .status(200)
      .json({ message: "Product removed from cart", cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const getCartItems = async (req, res) => {
  try {
    const userId = req.params.id; // Foydalanuvchi ID'sini URL'dan olish

    const user = await User.findById(userId).populate("cart.productId");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const cartItems = user.cart.map((item) => {
      return {
        product: item.productId,
        quantity: item.quantity,
        totalPrice: item.productId.price * item.quantity,
      };
    });
    const totalCartPrice = cartItems.reduce(
      (total, item) => total + item.totalPrice,
      0
    );
    res.status(200).json({
      cartItems,
      totalCartPrice,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Foydalanuvchining manzilini yangilash
const updateAddress = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { street, city, state, zip } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.address = { street, city, state, zip };
    await user.save();

    res
      .status(200)
      .json({ message: "Address updated successfully", address: user.address });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Parolni tiklash so'rovini yuborish
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Password Reset",
      text:
        `Siz buni hisobingiz uchun parolni tiklashni so'raganingiz uchun qabul qilyapsiz.\n\n` +
        `Iltimos, quyidagi havolani bosing yoki jarayonni yakunlash uchun uni brauzeringizda oching:\n\n` +
        `http://${req.headers.host}/users/reset/${token}\n\n` +
        `Agar siz buni so'ramagan bo'lsangiz, iltimos, ushbu elektron pochtaga e'tibor bermang va parolingiz o'zgarishsiz qoladi.\n`,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.error("Error sending email:", err);
        return res
          .status(500)
          .json({ message: "Error sending email", error: err });
      }
      res.status(200).json({ message: "Email sent" });
    });
  } catch (error) {
    console.error("Error processing forgot password:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Parolni tiklash tokeni bilan yangi parolni kiritish
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Password reset token is invalid or has expired" });
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.status(200).json({ message: "Password has been reset" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const addImageProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const profileImage = req.file ? req.file.path : null;

    if (!profileImage) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { profileImage },
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
  addImageProfile,
};
