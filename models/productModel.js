const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  images: [
    {
      type: String,
    },
  ],
  color: {
    type: String,
    required: true, // O'rnatishingiz mumkin agar har doim bo'lishi kerak bo'lsa
  },
  attributes: [
    {
      name: {
        type: String,
        required: true,
      },
      value: {
        type: String,
        required: true,
      },
    },
  ],
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
    required: true,
  },
  soldCount: {
    type: Number,
    default: 0,
  },
  stock: {
    type: Number,
    required: true,
  },
});

productSchema.virtual("imageUrls").get(function () {
  return this.images.map((image) => `${process.env.BASE_URL}/public/${image}`);
});

module.exports = mongoose.model("Product", productSchema);
