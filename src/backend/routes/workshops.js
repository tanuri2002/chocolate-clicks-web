const express = require("express");
const multer = require("multer");
const Workshop = require("../models/Workshop");
const WorkshopRegistration = require("../models/WorkshopRegistration");
const EventCategory = require("../models/EventCategory");
const cloudinary = require("../config/cloudinary");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

const DEFAULT_BANNER =
  "https://res.cloudinary.com/kypjwevn/image/upload/v1792780940/chocolate-clicks/workshops/qzrtd0y07en0twzuarde.webp";

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

/**
 * Format a Date object into a readable time string in Asia/Colombo timezone
 */
function formatSriLankaTime(date) {
  if (!date) return "";
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Colombo",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(date));
  } catch {
    return "";
  }
}

/**
 * Parses date string ("YYYY-MM-DD" or ISO) and time string ("HH:mm" or "hh:mm am/pm")
 * into a single Date object aligned with Sri Lanka timezone (UTC+05:30).
 */
function parseSriLankaDateTime(dateStr, timeStr) {
  if (!dateStr) return null;
  let d = String(dateStr).trim();
  let t = String(timeStr || "").trim();

  // If date already includes a time (like datetime-local "YYYY-MM-DDTHH:mm")
  if (d.includes("T")) {
    const parts = d.split("T");
    d = parts[0];
    if (!t) t = parts[1].substring(0, 5);
  }

  if (!t) t = "10:00"; // Default to 10:00 AM

  // Parse 12-hour or 24-hour time
  let hour = 10;
  let minute = 0;
  const match = t.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
  if (match) {
    hour = parseInt(match[1], 10);
    minute = parseInt(match[2], 10);
    const meridiem = (match[3] || "").toLowerCase();
    if (meridiem === "pm" && hour < 12) hour += 12;
    if (meridiem === "am" && hour === 12) hour = 0;
  }

  const pad = (n) => String(n).padStart(2, "0");
  const isoWithTz = `${d}T${pad(hour)}:${pad(minute)}:00+05:30`;
  const parsed = new Date(isoWithTz);

  if (Number.isNaN(parsed.getTime())) {
    // Fallback to basic Date parsing
    return new Date(dateStr);
  }
  return parsed;
}

const DEFAULT_CATEGORIES = [
  { name: "Sri Lankan Wes Mask Painting", description: "Traditional Sri Lankan folklore mask painting experience" },
  { name: "Bake It Happen", description: "Bake your cake culinary masterclass" },
];

// ── Category routes ──────────────────────────────────────────────────────────

router.get("/categories", async (req, res) => {
  try {
    let categories = await EventCategory.find().sort({ createdAt: 1 });
    if (categories.length === 0) {
      await EventCategory.insertMany(DEFAULT_CATEGORIES);
      categories = await EventCategory.find().sort({ createdAt: 1 });
    }
    return res.json({ success: true, categories });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/categories", protect, authorize("admin"), async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }
    const trimmedName = name.trim();
    const existing = await EventCategory.findOne({ name: { $regex: new RegExp(`^${trimmedName}$`, "i") } });
    if (existing) {
      return res.status(409).json({ success: false, message: "Category already exists" });
    }

    const category = await EventCategory.create({
      name: trimmedName,
      description: description?.trim() || "",
    });
    return res.status(201).json({ success: true, category });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/categories/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const category = await EventCategory.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    return res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ── GET /api/events or /api/workshops ─────────────────────────────────────────
// Supports ?type=upcoming|past|all or ?period=upcoming|past|all
router.get("/", async (req, res) => {
  try {
    const typeParam = req.query.type || req.query.period;
    const now = new Date();

    const query = { isPublished: true };

    let sort = { date: 1 }; // Default soonest first
    if (typeParam === "past") {
      query.date = { $lt: now };
      sort = { date: -1 }; // Most recent past first
    } else if (typeParam === "upcoming") {
      query.date = { $gte: now };
      sort = { date: 1 }; // Soonest upcoming first
    } else if (typeParam === "all") {
      // Return all events sorted soonest first
      sort = { date: 1 };
    }

    if (req.query.category && req.query.category !== "all") {
      const cat = req.query.category.trim();
      if (/mask/i.test(cat)) {
        query.$or = [
          { category: { $regex: /mask/i } },
          { category: { $exists: false } },
          { category: null },
          { category: "" },
        ];
      } else if (/bake/i.test(cat)) {
        query.category = { $regex: /bake/i };
      } else {
        query.category = { $regex: new RegExp(cat, "i") };
      }
    }

    const workshops = await Workshop.find(query).sort(sort);

    const withDetails = await Promise.all(
      workshops.map(async (workshop) => {
        const obj = workshop.toObject();
        const venue = obj.venue || obj.location || "Chocolate Clicks Studio";
        const availableSlots =
          obj.availableSlots !== undefined && obj.availableSlots !== null
            ? obj.availableSlots
            : obj.capacity !== null && obj.capacity !== undefined
            ? obj.capacity
            : 20;

        const time = obj.time || formatSriLankaTime(obj.date);
        const registrationCount = await WorkshopRegistration.countDocuments({ workshop: workshop._id });

        return {
          ...obj,
          venue,
          location: venue,
          time,
          availableSlots,
          capacity: availableSlots,
          category: obj.category || "Mask Painting",
          registrationCount,
        };
      })
    );

    return res.json({
      success: true,
      events: withDetails,
      workshops: withDetails,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ── GET /admin ───────────────────────────────────────────────────────────────
router.get("/admin", protect, authorize("admin"), async (req, res) => {
  try {
    const workshops = await Workshop.find().sort({ date: -1 });
    const withDetails = await Promise.all(
      workshops.map(async (workshop) => {
        const obj = workshop.toObject();
        const venue = obj.venue || obj.location || "Chocolate Clicks Studio";
        const availableSlots =
          obj.availableSlots !== undefined && obj.availableSlots !== null
            ? obj.availableSlots
            : obj.capacity !== null && obj.capacity !== undefined
            ? obj.capacity
            : 20;
        const time = obj.time || formatSriLankaTime(obj.date);
        const registrationCount = await WorkshopRegistration.countDocuments({ workshop: workshop._id });

        return {
          ...obj,
          venue,
          location: venue,
          time,
          availableSlots,
          capacity: availableSlots,
          category: obj.category || "Mask Painting",
          registrationCount,
        };
      })
    );
    return res.json({ success: true, events: withDetails, workshops: withDetails });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ── POST /api/events or /api/workshops (Create) ──────────────────────────────
router.post("/", protect, authorize("admin"), upload.single("banner"), async (req, res) => {
  try {
    const { title, category, date, time, venue, location, availableSlots, capacity, description } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: "Category is required" });
    }
    if (!date) {
      return res.status(400).json({ success: false, message: "Date is required" });
    }
    if (!time || !time.trim()) {
      return res.status(400).json({ success: false, message: "Time is required" });
    }

    const resolvedVenue = (venue || location || "").trim();
    if (!resolvedVenue) {
      return res.status(400).json({ success: false, message: "Venue is required" });
    }

    // Validate available slots integer >= 0
    const rawSlots = availableSlots !== undefined ? availableSlots : capacity;
    if (rawSlots === undefined || rawSlots === null || rawSlots === "") {
      return res.status(400).json({ success: false, message: "Available slots is required" });
    }
    const parsedSlots = Number(rawSlots);
    if (!Number.isInteger(parsedSlots) || parsedSlots < 0) {
      return res.status(400).json({
        success: false,
        message: "Available slots must be a whole number greater than or equal to 0",
      });
    }

    // Parse date and time in Sri Lanka timezone
    const parsedDate = parseSriLankaDateTime(date, time);
    if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ success: false, message: "Provide a valid date and time" });
    }

    let bannerUrl = DEFAULT_BANNER;
    if (req.file) {
      bannerUrl = await uploadBanner(req.file.buffer);
    } else if (req.body.bannerUrl && req.body.bannerUrl.trim()) {
      bannerUrl = req.body.bannerUrl.trim();
    }

    const workshop = await Workshop.create({
      title: title.trim(),
      category: category.trim(),
      date: parsedDate,
      time: time.trim(),
      venue: resolvedVenue,
      location: resolvedVenue,
      availableSlots: parsedSlots,
      capacity: parsedSlots,
      description: (description || "").trim(),
      bannerUrl,
      isPublished: true,
    });

    const populated = {
      ...workshop.toObject(),
      venue: resolvedVenue,
      location: resolvedVenue,
      time: time.trim(),
      availableSlots: parsedSlots,
      registrationCount: 0,
    };

    return res.status(201).json({
      success: true,
      event: populated,
      workshop: populated,
      message: "Workshop created successfully",
    });
  } catch (error) {
    console.error("Create workshop error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to create workshop" });
  }
});

// ── PUT /api/events/:id or /api/workshops/:id (Edit) ─────────────────────────
router.put("/:id", protect, authorize("admin"), upload.single("banner"), async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) {
      return res.status(404).json({ success: false, message: "Workshop not found" });
    }

    const { title, category, date, time, venue, location, availableSlots, capacity, description } = req.body;

    if (title !== undefined) {
      if (!title.trim()) return res.status(400).json({ success: false, message: "Title cannot be empty" });
      workshop.title = title.trim();
    }

    if (category !== undefined) {
      if (!category.trim()) return res.status(400).json({ success: false, message: "Category cannot be empty" });
      workshop.category = category.trim();
    }

    const resolvedVenue = venue !== undefined ? venue : location;
    if (resolvedVenue !== undefined) {
      if (!resolvedVenue.trim()) return res.status(400).json({ success: false, message: "Venue cannot be empty" });
      workshop.venue = resolvedVenue.trim();
      workshop.location = resolvedVenue.trim();
    }

    if (description !== undefined) {
      workshop.description = description.trim();
    }

    // Handle date and time updates
    const newTime = time !== undefined ? time.trim() : workshop.time || formatSriLankaTime(workshop.date);
    const newDate = date !== undefined ? date : workshop.date;
    if (date !== undefined || time !== undefined) {
      const parsedDate = parseSriLankaDateTime(newDate, newTime);
      if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({ success: false, message: "Provide a valid date and time" });
      }
      workshop.date = parsedDate;
      workshop.time = newTime;
    }

    // Handle available slots
    const rawSlots = availableSlots !== undefined ? availableSlots : capacity;
    if (rawSlots !== undefined && rawSlots !== "") {
      const parsedSlots = Number(rawSlots);
      if (!Number.isInteger(parsedSlots) || parsedSlots < 0) {
        return res.status(400).json({
          success: false,
          message: "Available slots must be a whole number greater than or equal to 0",
        });
      }
      workshop.availableSlots = parsedSlots;
      workshop.capacity = parsedSlots;
    }

    // Banner image upload if provided
    if (req.file) {
      workshop.bannerUrl = await uploadBanner(req.file.buffer);
    } else if (req.body.bannerUrl && req.body.bannerUrl.trim()) {
      workshop.bannerUrl = req.body.bannerUrl.trim();
    }

    await workshop.save();

    const registrationCount = await WorkshopRegistration.countDocuments({ workshop: workshop._id });
    const populated = {
      ...workshop.toObject(),
      venue: workshop.venue || workshop.location,
      time: workshop.time || formatSriLankaTime(workshop.date),
      availableSlots: workshop.availableSlots ?? workshop.capacity ?? 20,
      registrationCount,
    };

    return res.json({
      success: true,
      event: populated,
      workshop: populated,
      message: "Workshop updated successfully",
    });
  } catch (error) {
    console.error("Edit workshop error:", error);
    const status = error.name === "CastError" ? 404 : 500;
    return res.status(status).json({ success: false, message: error.message || "Failed to update workshop" });
  }
});

// ── PATCH /api/events/:id/slots (Update availableSlots only) ──────────────────
router.patch("/:id/slots", protect, authorize("admin"), async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) {
      return res.status(404).json({ success: false, message: "Workshop not found" });
    }

    const rawSlots =
      req.body.availableSlots !== undefined ? req.body.availableSlots : req.body.slots;

    if (rawSlots === undefined || rawSlots === null || rawSlots === "") {
      return res.status(400).json({ success: false, message: "Available slots is required" });
    }

    const parsedSlots = Number(rawSlots);
    if (!Number.isInteger(parsedSlots) || parsedSlots < 0) {
      return res.status(400).json({
        success: false,
        message: "Available slots must be a whole number greater than or equal to 0",
      });
    }

    workshop.availableSlots = parsedSlots;
    workshop.capacity = parsedSlots;
    await workshop.save();

    const registrationCount = await WorkshopRegistration.countDocuments({ workshop: workshop._id });
    const populated = {
      ...workshop.toObject(),
      venue: workshop.venue || workshop.location,
      time: workshop.time || formatSriLankaTime(workshop.date),
      availableSlots: parsedSlots,
      registrationCount,
    };

    return res.json({
      success: true,
      event: populated,
      workshop: populated,
      message: "Available slots updated successfully",
    });
  } catch (error) {
    const status = error.name === "CastError" ? 404 : 500;
    return res.status(status).json({ success: false, message: error.message || "Failed to update slots" });
  }
});

// Alias: PATCH /api/workshops/:id/capacity
router.patch("/:id/capacity", protect, authorize("admin"), async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) return res.status(404).json({ success: false, message: "Workshop not found" });

    const raw = req.body.capacity !== undefined ? req.body.capacity : req.body.availableSlots;
    const capacity = raw === "" || raw === null ? null : Number(raw);

    if (capacity !== null && (!Number.isInteger(capacity) || capacity < 0)) {
      return res.status(400).json({
        success: false,
        message: "Capacity must be a positive whole number or 0",
      });
    }

    workshop.capacity = capacity;
    if (capacity !== null) workshop.availableSlots = capacity;
    await workshop.save();

    const registrationCount = await WorkshopRegistration.countDocuments({ workshop: workshop._id });
    return res.json({
      success: true,
      workshop: { ...workshop.toObject(), registrationCount },
    });
  } catch (error) {
    const status = error.name === "CastError" ? 404 : 500;
    return res.status(status).json({ success: false, message: error.message });
  }
});

// ── DELETE /api/events/:id or /api/workshops/:id ─────────────────────────────
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const workshop = await Workshop.findByIdAndDelete(req.params.id);
    if (!workshop) {
      return res.status(404).json({ success: false, message: "Workshop not found" });
    }

    // Clean up any registrations for this workshop
    await WorkshopRegistration.deleteMany({ workshop: workshop._id });

    return res.json({ success: true, message: "Workshop deleted successfully" });
  } catch (error) {
    const status = error.name === "CastError" ? 404 : 500;
    return res.status(status).json({ success: false, message: error.message || "Failed to delete workshop" });
  }
});

// ── Registration endpoints ───────────────────────────────────────────────────

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

router.post("/:id/registrations", async (req, res) => {
  try {
    const workshop = await Workshop.findOne({ _id: req.params.id, isPublished: true });
    if (!workshop) return res.status(404).json({ success: false, message: "Workshop not found" });
    if (workshop.date < new Date()) {
      return res.status(400).json({ success: false, message: "Registration is closed for this workshop" });
    }

    const effectiveLimit =
      workshop.availableSlots !== undefined ? workshop.availableSlots : workshop.capacity;

    if (effectiveLimit !== null && effectiveLimit !== undefined) {
      const registrationCount = await WorkshopRegistration.countDocuments({ workshop: workshop._id });
      if (registrationCount >= effectiveLimit) {
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
    const obj = workshop.toObject();
    const venue = obj.venue || obj.location || "Chocolate Clicks Studio";
    const availableSlots = obj.availableSlots !== undefined ? obj.availableSlots : (obj.capacity ?? 20);
    const time = obj.time || formatSriLankaTime(obj.date);

    return res.json({
      success: true,
      workshop: {
        ...obj,
        venue,
        location: venue,
        time,
        availableSlots,
        capacity: availableSlots,
        category: obj.category || "Mask Painting",
        registrationCount,
      },
    });
  } catch (error) {
    const status = error.name === "CastError" ? 404 : 500;
    return res.status(status).json({ success: false, message: status === 404 ? "Workshop not found" : error.message });
  }
});

module.exports = router;