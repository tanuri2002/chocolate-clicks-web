const express = require("express");
const multer = require("multer");
const Menu = require("../models/Menu");
const { cloudinary, uploadMenuImage } = require("../config/menuUpload");
const { MENU_CATEGORIES } = require("../config/categories");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

/**
 * Middleware wrapper to cleanly handle Multer & Cloudinary upload errors
 */
const handleUpload = (req, res, next) => {
  uploadMenuImage.single("image")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "Image file size exceeds the 5MB limit",
        });
      }
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "Failed to upload image",
      });
    }
    next();
  });
};

// @route   GET /api/menu
// @desc    List menu items (Public: active items only; admin with ?all=true: all items)
// @access  Public
router.get("/", async (req, res) => {
  try {
    const showAll = req.query.all === "true";
    const filter = showAll ? {} : { isActive: { $ne: false } };

    const items = await Menu.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: items.length, items });
  } catch (error) {
    console.error("Fetch menu items error:", error);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
});

// @route   POST /api/menu
// @desc    Create a new menu item
// @access  Private/Admin
router.post(
  "/",
  protect,
  authorize("admin"),
  handleUpload,
  async (req, res) => {
    try {
      const { name, category, description, price, isActive } = req.body;

      // 1. Validate required fields
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: "Item name is required" });
      }

      if (!category || !MENU_CATEGORIES.includes(category.trim())) {
        return res.status(400).json({
          success: false,
          message: `Category must be one of: ${MENU_CATEGORIES.join(", ")}`,
        });
      }

      const parsedPrice = Number(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({
          success: false,
          message: "Price must be a valid positive number",
        });
      }

      // 2. Validate image file is uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Menu item image is required",
        });
      }

      const imageUrl = req.file.path || req.file.secure_url;
      const imagePublicId = req.file.filename || req.file.public_id || "";

      const activeStatus =
        isActive === undefined
          ? true
          : isActive === true || isActive === "true" || isActive === 1 || isActive === "1";

      const newItem = await Menu.create({
        name: name.trim(),
        category: category.trim(),
        description: description ? description.trim() : "",
        price: parsedPrice,
        imageUrl,
        imagePublicId,
        isActive: activeStatus,
      });

      // TODO: later: email signed-up users about the new item

      res.status(201).json({ success: true, item: newItem });
    } catch (error) {
      console.error("Create menu item error:", error);
      res.status(500).json({ success: false, message: error.message || "Failed to create menu item" });
    }
  }
);

// @route   PUT /api/menu/:id
// @desc    Edit a menu item (image optional; deletes old Cloudinary image if new one uploaded)
// @access  Private/Admin
router.put(
  "/:id",
  protect,
  authorize("admin"),
  handleUpload,
  async (req, res) => {
    try {
      const item = await Menu.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ success: false, message: "Menu item not found" });
      }

      const { name, category, description, price, isActive } = req.body;

      if (name !== undefined) {
        if (!name.trim()) {
          return res.status(400).json({ success: false, message: "Item name cannot be empty" });
        }
        item.name = name.trim();
      }

      if (category !== undefined) {
        if (!MENU_CATEGORIES.includes(category.trim())) {
          return res.status(400).json({
            success: false,
            message: `Category must be one of: ${MENU_CATEGORIES.join(", ")}`,
          });
        }
        item.category = category.trim();
      }

      if (description !== undefined) {
        item.description = description.trim();
      }

      if (price !== undefined) {
        const parsedPrice = Number(price);
        if (isNaN(parsedPrice) || parsedPrice < 0) {
          return res.status(400).json({
            success: false,
            message: "Price must be a valid positive number",
          });
        }
        item.price = parsedPrice;
      }


      if (isActive !== undefined) {
        const activeStatus =
          isActive === true || isActive === "true" || isActive === 1 || isActive === "1";
        item.isActive = activeStatus;
      }

      // If a new image was uploaded, delete the old Cloudinary image and assign new image
      if (req.file) {
        if (item.imagePublicId) {
          try {
            await cloudinary.uploader.destroy(item.imagePublicId);
          } catch (deleteError) {
            console.error("Error deleting old Cloudinary image:", deleteError);
          }
        }
        item.imageUrl = req.file.path || req.file.secure_url;
        item.imagePublicId = req.file.filename || req.file.public_id || "";
      }

      await item.save();

      res.status(200).json({ success: true, item });
    } catch (error) {
      console.error("Update menu item error:", error);
      res.status(500).json({ success: false, message: error.message || "Failed to update menu item" });
    }
  }
);

// @route   DELETE /api/menu/:id
// @desc    Delete a menu item and its Cloudinary image
// @access  Private/Admin
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const item = await Menu.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Menu item not found" });
    }

    // Delete image from Cloudinary if public ID exists
    if (item.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(item.imagePublicId);
      } catch (deleteError) {
        console.error("Error deleting Cloudinary image:", deleteError);
      }
    }

    await item.deleteOne();

    res.status(200).json({ success: true, message: "Menu item deleted successfully" });
  } catch (error) {
    console.error("Delete menu item error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to delete menu item" });
  }
});

module.exports = router;
