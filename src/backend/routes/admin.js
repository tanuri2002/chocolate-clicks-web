const express = require("express");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/stats", protect, authorize("admin"), async (req, res) => {
  try {
    const registeredCustomerCount = await User.countDocuments({ role: { $ne: "admin" } });
    return res.json({ success: true, registeredCustomerCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;