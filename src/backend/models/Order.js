const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Menu",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
      max: [20, "Quantity cannot exceed 20"],
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [
        (val) => Array.isArray(val) && val.length > 0 && val.length <= 50,
        "Order must contain between 1 and 50 items",
      ],
    },
    total: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "LKR",
      trim: true,
    },
    customer: {
      firstName: {
        type: String,
        required: true,
        trim: true,
      },
      lastName: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
    },
    orderType: {
      type: String,
      enum: ["pickup", "delivery"],
      required: true,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    city: {
      type: String,
      default: "",
      trim: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "cancelled", "chargedback"],
      default: "pending",
      index: true,
    },
    payhere: {
      paymentId: { type: String, default: "" },
      statusCode: { type: Number },
      method: { type: String, default: "" },
      statusMessage: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
