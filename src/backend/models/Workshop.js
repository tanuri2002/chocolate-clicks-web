const mongoose = require("mongoose");

const DEFAULT_BANNER = "https://res.cloudinary.com/kypjwevn/image/upload/v1792780940/chocolate-clicks/workshops/qzrtd0y07en0twzuarde.webp";

const workshopSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Title is required"], trim: true, maxlength: 120 },
    description: { type: String, default: "", trim: true, maxlength: 3000 },
    date: { type: Date, required: [true, "Date is required"], index: true },
    time: { type: String, trim: true, default: "" },
    venue: { type: String, trim: true, maxlength: 240 },
    location: { type: String, trim: true, maxlength: 240 },
    bannerUrl: { type: String, default: DEFAULT_BANNER },
    availableSlots: {
      type: Number,
      min: [0, "Available slots cannot be negative"],
      default: 20,
    },
    capacity: {
      type: Number,
      min: 0,
      default: null,
    },
    isPublished: { type: Boolean, default: true, index: true },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      default: "Mask Painting",
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-save hook to synchronize venue/location and availableSlots/capacity
workshopSchema.pre("save", function () {
  if (this.venue && !this.location) {
    this.location = this.venue;
  } else if (this.location && !this.venue) {
    this.venue = this.location;
  }

  if (this.availableSlots !== undefined && this.availableSlots !== null) {
    this.capacity = this.availableSlots;
  } else if (this.capacity !== undefined && this.capacity !== null) {
    this.availableSlots = this.capacity;
  }
});

module.exports = mongoose.model("Workshop", workshopSchema);