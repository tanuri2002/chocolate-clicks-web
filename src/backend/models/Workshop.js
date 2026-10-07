const mongoose = require("mongoose");

const workshopSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    date: { type: Date, required: true, index: true },
    location: { type: String, required: true, trim: true, maxlength: 240 },
    bannerUrl: { type: String, required: true },
    capacity: {
      type: Number,
      min: 1,
      validate: (value) => value === null || Number.isInteger(value),
      default: null,
    },
    isPublished: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Workshop", workshopSchema);