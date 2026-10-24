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

// @route   GET /api/admin/customers
// @desc    Retrieve all registered customers (role !== 'admin') with order count and total spent
// @access  Admin only
router.get("/customers", protect, authorize("admin"), async (req, res) => {
  try {
    const customers = await User.aggregate([
      { $match: { role: { $ne: "admin" } } },
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "user",
          as: "orders",
        },
      },
      {
        $project: {
          password: 0,
          resetPasswordToken: 0,
          resetPasswordExpires: 0,
        },
      },
      {
        $addFields: {
          ordersCount: { $size: "$orders" },
          totalSpent: {
            $sum: {
              $map: {
                input: "$orders",
                as: "ord",
                in: { $ifNull: ["$$ord.totalAmount", 0] },
              },
            },
          },
        },
      },
      { $project: { orders: 0 } },
      { $sort: { createdAt: -1 } },
    ]);

    return res.json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    console.error("Fetch customers error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;