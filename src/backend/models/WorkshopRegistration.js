const mongoose = require("mongoose");

const workshopRegistrationSchema = new mongoose.Schema(
  {
    workshop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workshop",
      required: true,
      index: true,
    },
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
    },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    notes: { type: String, trim: true, maxlength: 1000, default: "" },
  },
  { timestamps: true }
);

workshopRegistrationSchema.index({ workshop: 1, email: 1 }, { unique: true });

module.exports = mongoose.model("WorkshopRegistration", workshopRegistrationSchema);