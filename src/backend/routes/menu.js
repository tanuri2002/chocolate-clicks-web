const express = require("express");
const multer = require("multer");
const Menu = require("../models/Menu");
const cloudinary = require("../config/cloudinary");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

function uploadImageToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "chocolate-clicks/menu" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

// @route   GET /api/menu
// @desc    Get all menu items
// @access  Public
router.get("/", async (req, res) => {
  try {
    const items = await Menu.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/menu
// @desc    Create a menu item
// @access  Private/Admin
router.post("/", protect, authorize("admin"), upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, category, inStock } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, price and category",
      });
    }

    let imageUrl = "";
    if (req.file) {
      imageUrl = await uploadImageToCloudinary(req.file.buffer);
    }

    const item = await Menu.create({
      name,
      description,
      price,
      category,
      imageUrl,
      inStock: inStock === undefined ? true : inStock === "true" || inStock === true,
    });

    res.status(201).json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/menu/:id
// @desc    Update a menu item
// @access  Private/Admin
router.put("/:id", protect, authorize("admin"), upload.single("image"), async (req, res) => {
  try {
    const item = await Menu.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Menu item not found" });
    }

    const { name, description, price, category, inStock } = req.body;

    if (name !== undefined) item.name = name;
    if (description !== undefined) item.description = description;
    if (price !== undefined) item.price = price;
    if (category !== undefined) item.category = category;
    if (inStock !== undefined) item.inStock = inStock === "true" || inStock === true;

    if (req.file) {
      item.imageUrl = await uploadImageToCloudinary(req.file.buffer);
    }

    await item.save();

    res.status(200).json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/menu/:id
// @desc    Delete a menu item
// @access  Private/Admin
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const item = await Menu.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Menu item not found" });
    }

    await item.deleteOne();

    res.status(200).json({ success: true, message: "Menu item deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
