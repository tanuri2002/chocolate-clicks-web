const mongoose = require("mongoose");
const { MENU_CATEGORIES } = require("../config/categories");

const menuSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide an item name"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Please provide a category"],
      enum: {
        values: MENU_CATEGORIES,
        message: "{VALUE} is not a valid category",
      },
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Please provide a price"],
      min: [0, "Price cannot be negative"],
    },
    imageUrl: {
      type: String,
      default: "",
    },
    imagePublicId: {
      type: String,
      default: "",
    },
    maxPerOrder: {
      type: Number,
      default: 10,
      min: [1, "Max per order must be at least 1"],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    // Maintained for Flutter mobile app backward-compatibility
    inStock: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Menu", menuSchema);
