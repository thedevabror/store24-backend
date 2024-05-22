const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Path `username` is required."],
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  address: {
    street: { type: String, required: false, default: "" },
    city: { type: String, required: false, default: ""  },
    state: { type: String, required: false, default: ""  },
    zip: { type: String, required: false, default: ""  },
  },
  cart: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
      },
    },
  ],
  isAdmin: { type: Boolean, default: false },
  resetPasswordToken: {
    type: String,
    default: null,
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
  },
  isActive: { type: Boolean, default: true },
  profileImage: { type: String, default: null },
});

module.exports = mongoose.model("User", userSchema);
