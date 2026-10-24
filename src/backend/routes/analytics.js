const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const {
  getSalesTrend,
  getSummary,
  getTopProducts,
  getDemandHeatmap,
  getCustomerAnalytics,
  getRevenueForecast,
} = require("../services/analyticsService");

const router = express.Router();

// Middleware: validate range query param if provided
const validateRange = (req, res, next) => {
  const { range } = req.query;
  const validRanges = ["7d", "30d", "90d", "all"];
  if (range && !validRanges.includes(range.toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: `Invalid range parameter "${range}". Allowed values are: 7d, 30d, 90d, all`,
    });
  }
  next();
};

// All analytics routes require admin authentication
router.use(protect, authorize("admin"));

/**
 * 1. GET /api/analytics/sales-trend?range=7d|30d|90d|all&granularity=day|week|month
 */
router.get("/sales-trend", validateRange, async (req, res) => {
  try {
    const { range = "30d", granularity = "day" } = req.query;
    const validGranularities = ["day", "week", "month"];
    if (granularity && !validGranularities.includes(granularity.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid granularity "${granularity}". Allowed values: day, week, month`,
      });
    }

    const data = await getSalesTrend({
      range: range.toLowerCase(),
      granularity: granularity.toLowerCase(),
    });

    return res.json({ success: true, ...data });
  } catch (error) {
    console.error("Analytics sales-trend error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to load sales trend" });
  }
});

/**
 * 2. GET /api/analytics/summary?range=7d|30d|90d|all
 */
router.get("/summary", validateRange, async (req, res) => {
  try {
    const { range = "30d" } = req.query;
    const data = await getSummary({ range: range.toLowerCase() });
    return res.json({ success: true, ...data });
  } catch (error) {
    console.error("Analytics summary error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to load analytics summary" });
  }
});

/**
 * 3. GET /api/analytics/top-products?range=...&limit=5
 */
router.get("/top-products", validateRange, async (req, res) => {
  try {
    const { range = "30d", limit = 5 } = req.query;
    const parsedLimit = parseInt(limit, 10);
    if (limit && (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 50)) {
      return res.status(400).json({
        success: false,
        message: "Limit must be a positive integer between 1 and 50",
      });
    }

    const data = await getTopProducts({
      range: range.toLowerCase(),
      limit: parsedLimit || 5,
    });
    return res.json({ success: true, ...data });
  } catch (error) {
    console.error("Analytics top-products error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to load top products" });
  }
});

/**
 * 4. GET /api/analytics/demand-heatmap?range=...
 */
router.get("/demand-heatmap", validateRange, async (req, res) => {
  try {
    const { range = "30d" } = req.query;
    const data = await getDemandHeatmap({ range: range.toLowerCase() });
    return res.json({ success: true, ...data });
  } catch (error) {
    console.error("Analytics demand-heatmap error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to load demand heatmap" });
  }
});

/**
 * 5. GET /api/analytics/customers?range=...
 */
router.get("/customers", validateRange, async (req, res) => {
  try {
    const { range = "30d" } = req.query;
    const data = await getCustomerAnalytics({ range: range.toLowerCase() });
    return res.json({ success: true, ...data });
  } catch (error) {
    console.error("Analytics customers error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to load customer analytics" });
  }
});

/**
 * 6. GET /api/analytics/forecast
 */
router.get("/forecast", async (req, res) => {
  try {
    const data = await getRevenueForecast();
    return res.json(data);
  } catch (error) {
    console.error("Analytics forecast error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to calculate revenue forecast" });
  }
});

module.exports = router;
