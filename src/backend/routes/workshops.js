const express = require("express");
const multer = require("multer");
const Workshop = require("../models/Workshop");
const WorkshopRegistration = require("../models/WorkshopRegistration");
const cloudinary = require("../config/cloudinary");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      return callback(new Error("Banner must be an image"));
    }
    return callback(null, true);
  },
});

function uploadBanner(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "chocolate-clicks/workshops", resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

router.get("/", async (req, res) => {
  try {
    const period = req.query.period === "past" ? "past" : "upcoming";
    const operator = period === "past" ? "$lt" : "$gte";
    const workshops = await Workshop.find({
      isPublished: true,
      date: { [operator]: new Date() },
    }).sort({ date: period === "past" ? -1 : 1 });

    const withCounts = await Promise.all(workshops.map(async (workshop) => ({
      ...workshop.toObject(),
      registrationCount: await WorkshopRegistration.countDocuments({ workshop: workshop._id }),
    })));

    return res.json({ success: true, workshops: withCounts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/admin", protect, authorize("admin"), async (req, res) => {
  try {
    const workshops = await Workshop.find().sort({ date: -1 });
    const withCounts = await Promise.all(workshops.map(async (workshop) => ({
      ...workshop.toObject(),
      registrationCount: await WorkshopRegistration.countDocuments({ workshop: workshop._id }),
    })));
    return res.json({ success: true, workshops: withCounts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/", protect, authorize("admin"), upload.single("banner"), async (req, res) => {
  try {
    const { title, description, date, location, capacity } = req.body;
    if (!title || !description || !date || !location || !req.file) {
      return res.status(400).json({ success: false, message: "Title, description, date, location, and banner are required" });
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ success: false, message: "Provide a valid workshop date" });
    }
    if (capacity && (!Number.isInteger(Number(capacity)) || Number(capacity) < 1)) {
      return res.status(400).json({ success: false, message: "Capacity must be a positive whole number" });
    }

    const bannerUrl = await uploadBanner(req.file.buffer);
    const workshop = await Workshop.create({
      title,
      description,
      date: parsedDate,
      location,
      bannerUrl,
      capacity: capacity ? Number(capacity) : null,
    });
    return res.status(201).json({ success: true, workshop: { ...workshop.toObject(), registrationCount: 0 } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/:id/registrations", protect, authorize("admin"), async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) return res.status(404).json({ success: false, message: "Workshop not found" });

    const registrations = await WorkshopRegistration.find({ workshop: workshop._id }).sort({ createdAt: -1 });
    return res.json({ success: true, workshop, registrations });
  } catch (error) {
    const status = error.name === "CastError" ? 404 : 500;
    return res.status(status).json({ success: false, message: status === 404 ? "Workshop not found" : error.message });
  }
});

router.patch("/:id/capacity", protect, authorize("admin"), async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) return res.status(404).json({ success: false, message: "Workshop not found" });

    const capacity = req.body.capacity === "" || req.body.capacity === null
      ? null
      : Number(req.body.capacity);
    if (capacity !== null && (!Number.isInteger(capacity) || capacity < 1)) {
      return res.status(400).json({ success: false, message: "Capacity must be a positive whole number, or blank for unlimited" });
    }

    const registrationCount = await WorkshopRegistration.countDocuments({ workshop: workshop._id });
    if (capacity !== null && capacity < registrationCount) {
      return res.status(409).json({ success: false, message: `Capacity cannot be less than the ${registrationCount} existing registration(s)` });
    }

    workshop.capacity = capacity;
    await workshop.save();
    return res.json({ success: true, workshop: { ...workshop.toObject(), registrationCount } });
  } catch (error) {
    const status = error.name === "CastError" ? 404 : 500;
    return res.status(status).json({ success: false, message: status === 404 ? "Workshop not found" : error.message });
  }
});

router.post("/:id/registrations", async (req, res) => {
  try {
    const workshop = await Workshop.findOne({ _id: req.params.id, isPublished: true });
    if (!workshop) return res.status(404).json({ success: false, message: "Workshop not found" });
    if (workshop.date < new Date()) return res.status(400).json({ success: false, message: "Registration is closed for this workshop" });
    if (workshop.capacity !== null) {
      const registrationCount = await WorkshopRegistration.countDocuments({ workshop: workshop._id });
      if (registrationCount >= workshop.capacity) {
        return res.status(409).json({ success: false, message: "This workshop is fully booked" });
      }
    }

    const { fullName, email, phone, notes = "" } = req.body;
    if (!fullName?.trim() || !email?.trim() || !phone?.trim()) {
      return res.status(400).json({ success: false, message: "Name, email, and phone are required" });
    }

    const registration = await WorkshopRegistration.create({
      workshop: workshop._id,
      fullName,
      email,
      phone,
      notes,
    });
    return res.status(201).json({ success: true, registration });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "This email is already registered for the workshop" });
    }
    const status = error.name === "CastError" ? 404 : 500;
    return res.status(status).json({ success: false, message: status === 404 ? "Workshop not found" : error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const workshop = await Workshop.findOne({ _id: req.params.id, isPublished: true });
    if (!workshop) return res.status(404).json({ success: false, message: "Workshop not found" });
    const registrationCount = await WorkshopRegistration.countDocuments({ workshop: workshop._id });
    return res.json({ success: true, workshop: { ...workshop.toObject(), registrationCount } });
  } catch (error) {
    const status = error.name === "CastError" ? 404 : 500;
    return res.status(status).json({ success: false, message: status === 404 ? "Workshop not found" : error.message });
  }
});

module.exports = router;