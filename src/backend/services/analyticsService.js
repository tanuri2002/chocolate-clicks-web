const Order = require("../models/Order");
const User = require("../models/User");
const Menu = require("../models/Menu");

const TIMEZONE = "Asia/Colombo";

/**
 * Validates and parses the range parameter
 * @param {string} range - '7d' | '30d' | '90d' | 'all'
 * @returns {{ startDate: Date|null, endDate: Date, previousStartDate: Date|null, previousEndDate: Date|null, rangeKey: string }}
 */
function parseRange(range = "30d") {
  const validRanges = ["7d", "30d", "90d", "all"];
  const rangeKey = validRanges.includes(range) ? range : "30d";

  const now = new Date();
  const endDate = new Date(now);

  if (rangeKey === "all") {
    return {
      startDate: null,
      endDate,
      previousStartDate: null,
      previousEndDate: null,
      rangeKey,
    };
  }

  const days = rangeKey === "7d" ? 7 : rangeKey === "30d" ? 30 : 90;

  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);

  const previousEndDate = new Date(startDate);
  const previousStartDate = new Date(startDate);
  previousStartDate.setDate(previousStartDate.getDate() - days);

  return {
    startDate,
    endDate,
    previousStartDate,
    previousEndDate,
    rangeKey,
  };
}

/**
 * Helper to compute percentage change
 */
function calculatePercentageChange(current, previous) {
  const curr = Number(current) || 0;
  const prev = Number(previous) || 0;
  if (prev === 0) {
    return curr > 0 ? 100 : 0;
  }
  return Number((((curr - prev) / prev) * 100).toFixed(1));
}

/**
 * Formats a Date object to YYYY-MM-DD in Asia/Colombo
 */
function formatDateInTZ(date, tz = TIMEZONE) {
  const d = new Date(date);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(d); // Returns YYYY-MM-DD
}

/**
 * 1. GET /sales-trend
 */
async function getSalesTrend({ range = "30d", granularity = "day" } = {}) {
  const { startDate, endDate, rangeKey } = parseRange(range);

  // Validate granularity
  const validGranularities = ["day", "week", "month"];
  let gran = validGranularities.includes(granularity) ? granularity : "day";
  if (rangeKey === "all" && !granularity) gran = "month";

  const matchFilter = { status: { $ne: "Cancelled" } };
  if (startDate) {
    matchFilter.createdAt = { $gte: startDate, $lte: endDate };
  }

  let formatString = "%Y-%m-%d";
  if (gran === "week") {
    formatString = "%G-W%V";
  } else if (gran === "month") {
    formatString = "%Y-%m";
  }

  const results = await Order.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: {
          $dateToString: {
            date: "$createdAt",
            timezone: TIMEZONE,
            format: formatString,
          },
        },
        revenue: { $sum: "$total" },
        orderCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const dataMap = new Map();
  for (const r of results) {
    if (r._id) {
      dataMap.set(r._id, {
        revenue: Math.round(r.revenue * 100) / 100,
        orderCount: r.orderCount,
      });
    }
  }

  // Zero-fill missing intervals
  let effectiveStartDate = startDate;
  if (!effectiveStartDate) {
    const oldestOrder = await Order.findOne({ status: { $ne: "Cancelled" } }).sort({ createdAt: 1 });
    effectiveStartDate = oldestOrder ? oldestOrder.createdAt : new Date(Date.now() - 30 * 86400000);
  }

  const timeline = [];
  const cursor = new Date(effectiveStartDate);
  const targetEnd = new Date(endDate);

  if (gran === "day") {
    while (cursor <= targetEnd) {
      const key = formatDateInTZ(cursor);
      const existing = dataMap.get(key) || { revenue: 0, orderCount: 0 };
      timeline.push({
        date: key,
        revenue: existing.revenue,
        orderCount: existing.orderCount,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
  } else if (gran === "month") {
    cursor.setDate(1);
    while (cursor <= targetEnd) {
      const yearMonth = formatDateInTZ(cursor).slice(0, 7);
      const existing = dataMap.get(yearMonth) || { revenue: 0, orderCount: 0 };
      timeline.push({
        date: yearMonth,
        revenue: existing.revenue,
        orderCount: existing.orderCount,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
  } else {
    // Week or fallback
    for (const [key, val] of dataMap.entries()) {
      timeline.push({ date: key, ...val });
    }
    if (timeline.length === 0) {
      timeline.push({ date: formatDateInTZ(new Date()), revenue: 0, orderCount: 0 });
    }
  }

  return {
    range: rangeKey,
    granularity: gran,
    trend: timeline,
  };
}

/**
 * 2. GET /summary
 */
async function getSummary({ range = "30d" } = {}) {
  const { startDate, endDate, previousStartDate, previousEndDate, rangeKey } = parseRange(range);

  const currentMatch = { status: { $ne: "Cancelled" } };
  if (startDate) {
    currentMatch.createdAt = { $gte: startDate, $lte: endDate };
  }

  const [currentAgg] = await Order.aggregate([
    { $match: currentMatch },
    {
      $group: {
        _id: null,
        revenue: { $sum: "$total" },
        orderCount: { $sum: 1 },
      },
    },
  ]);

  const currentRevenue = currentAgg?.revenue || 0;
  const currentOrders = currentAgg?.orderCount || 0;
  const currentAOV = currentOrders > 0 ? currentRevenue / currentOrders : 0;

  let previousRevenue = 0;
  let previousOrders = 0;
  let previousAOV = 0;

  if (previousStartDate && previousEndDate) {
    const [prevAgg] = await Order.aggregate([
      {
        $match: {
          status: { $ne: "Cancelled" },
          createdAt: { $gte: previousStartDate, $lt: previousEndDate },
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$total" },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    previousRevenue = prevAgg?.revenue || 0;
    previousOrders = prevAgg?.orderCount || 0;
    previousAOV = previousOrders > 0 ? previousRevenue / previousOrders : 0;
  }

  return {
    range: rangeKey,
    current: {
      revenue: Math.round(currentRevenue * 100) / 100,
      orderCount: currentOrders,
      avgOrderValue: Math.round(currentAOV * 100) / 100,
    },
    previous: {
      revenue: Math.round(previousRevenue * 100) / 100,
      orderCount: previousOrders,
      avgOrderValue: Math.round(previousAOV * 100) / 100,
    },
    changes: {
      revenueChange: calculatePercentageChange(currentRevenue, previousRevenue),
      orderCountChange: calculatePercentageChange(currentOrders, previousOrders),
      avgOrderValueChange: calculatePercentageChange(currentAOV, previousAOV),
    },
  };
}

/**
 * 3. GET /top-products
 */
async function getTopProducts({ range = "30d", limit = 5 } = {}) {
  const { startDate, endDate, rangeKey } = parseRange(range);
  const parsedLimit = Math.max(1, Math.min(50, Number(limit) || 5));

  const matchFilter = { status: { $ne: "Cancelled" } };
  if (startDate) {
    matchFilter.createdAt = { $gte: startDate, $lte: endDate };
  }

  // Top products by quantity sold & revenue
  const topProducts = await Order.aggregate([
    { $match: matchFilter },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.name",
        quantity: { $sum: "$items.quantity" },
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
      },
    },
    { $sort: { quantity: -1, revenue: -1 } },
    { $limit: parsedLimit },
    {
      $project: {
        _id: 0,
        name: "$_id",
        quantity: 1,
        revenue: { $round: ["$revenue", 2] },
      },
    },
  ]);

  // Category-wise revenue distribution
  const categoryDistribution = await Order.aggregate([
    { $match: matchFilter },
    { $unwind: "$items" },
    {
      $lookup: {
        from: "menus",
        localField: "items.menuItem",
        foreignField: "_id",
        as: "menuDoc",
      },
    },
    {
      $addFields: {
        categoryName: {
          $ifNull: [{ $arrayElemAt: ["$menuDoc.category", 0] }, "Cakes"],
        },
      },
    },
    {
      $group: {
        _id: "$categoryName",
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        quantity: { $sum: "$items.quantity" },
      },
    },
    { $sort: { revenue: -1 } },
    {
      $project: {
        _id: 0,
        category: "$_id",
        revenue: { $round: ["$revenue", 2] },
        quantity: 1,
      },
    },
  ]);

  return {
    range: rangeKey,
    topProducts,
    categoryDistribution,
  };
}

/**
 * 4. GET /demand-heatmap
 */
async function getDemandHeatmap({ range = "30d" } = {}) {
  const { startDate, endDate, rangeKey } = parseRange(range);

  const matchFilter = { status: { $ne: "Cancelled" } };
  if (startDate) {
    matchFilter.createdAt = { $gte: startDate, $lte: endDate };
  }

  const rawHeatmap = await Order.aggregate([
    { $match: matchFilter },
    {
      $project: {
        parts: {
          $dateToParts: {
            date: "$createdAt",
            timezone: TIMEZONE,
          },
        },
      },
    },
    {
      $project: {
        weekday: { $subtract: ["$parts.dayOfWeek", 1] }, // 0 (Sun) to 6 (Sat)
        hour: "$parts.hour", // 0 to 23
      },
    },
    {
      $group: {
        _id: { weekday: "$weekday", hour: "$hour" },
        count: { $sum: 1 },
      },
    },
  ]);

  const heatMapLookup = new Map();
  let maxCount = 0;
  let totalOrders = 0;

  for (const item of rawHeatmap) {
    const key = `${item._id.weekday}-${item._id.hour}`;
    heatMapLookup.set(key, item.count);
    if (item.count > maxCount) maxCount = item.count;
    totalOrders += item.count;
  }

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const matrix = [];

  for (let w = 0; w < 7; w++) {
    const hours = [];
    for (let h = 0; h < 24; h++) {
      const count = heatMapLookup.get(`${w}-${h}`) || 0;
      hours.push({
        hour: h,
        count,
      });
    }
    matrix.push({
      weekday: w,
      dayName: days[w],
      hours,
    });
  }

  return {
    range: rangeKey,
    maxCount,
    totalOrders,
    matrix,
  };
}

/**
 * 5. GET /customers
 */
async function getCustomerAnalytics({ range = "30d" } = {}) {
  const { startDate, endDate, rangeKey } = parseRange(range);

  // 1. Registrations per day in range
  const userMatch = { role: { $ne: "admin" } };
  if (startDate) {
    userMatch.createdAt = { $gte: startDate, $lte: endDate };
  }

  const registrationsRaw = await User.aggregate([
    { $match: userMatch },
    {
      $group: {
        _id: {
          $dateToString: {
            date: "$createdAt",
            timezone: TIMEZONE,
            format: "%Y-%m-%d",
          },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const regMap = new Map();
  for (const r of registrationsRaw) {
    if (r._id) regMap.set(r._id, r.count);
  }

  // 2. Active customers per day (who placed an order) in range
  const orderMatch = { status: { $ne: "Cancelled" } };
  if (startDate) {
    orderMatch.createdAt = { $gte: startDate, $lte: endDate };
  }

  const activeRaw = await Order.aggregate([
    { $match: orderMatch },
    {
      $group: {
        _id: {
          date: {
            $dateToString: {
              date: "$createdAt",
              timezone: TIMEZONE,
              format: "%Y-%m-%d",
            },
          },
          user: "$user",
        },
      },
    },
    {
      $group: {
        _id: "$_id.date",
        activeCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const activeMap = new Map();
  for (const a of activeRaw) {
    if (a._id) activeMap.set(a._id, a.activeCount);
  }

  // Zero-fill trends
  const trend = [];
  const startDay = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 86400000);
  const cursor = new Date(startDay);
  const targetEnd = new Date(endDate);

  while (cursor <= targetEnd) {
    const key = formatDateInTZ(cursor);
    trend.push({
      date: key,
      newRegistrations: regMap.get(key) || 0,
      activeCustomers: activeMap.get(key) || 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  // 3. Repeat rate: percent of customers with 2+ orders (all historical non-cancelled)
  const customerOrderCounts = await Order.aggregate([
    { $match: { status: { $ne: "Cancelled" } } },
    {
      $group: {
        _id: "$user",
        orders: { $sum: 1 },
      },
    },
  ]);

  const totalDistinctCustomers = customerOrderCounts.length;
  const repeatCustomers = customerOrderCounts.filter((c) => c.orders >= 2).length;
  const repeatRate =
    totalDistinctCustomers > 0
      ? Number(((repeatCustomers / totalDistinctCustomers) * 100).toFixed(1))
      : 0;

  // 4. Customer Segments:
  // - new (1 order)
  // - returning (2+ orders)
  // - inactive (no orders in last 30 days or registered with 0 orders)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const customerProfiles = await User.aggregate([
    { $match: { role: { $ne: "admin" } } },
    {
      $lookup: {
        from: "orders",
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$user", "$$userId"] },
                  { $ne: ["$status", "Cancelled"] },
                ],
              },
            },
          },
          { $project: { createdAt: 1 } },
          { $sort: { createdAt: -1 } },
        ],
        as: "userOrders",
      },
    },
    {
      $project: {
        orderCount: { $size: "$userOrders" },
        latestOrderDate: { $arrayElemAt: ["$userOrders.createdAt", 0] },
      },
    },
  ]);

  let segmentNew = 0;
  let segmentReturning = 0;
  let segmentInactive = 0;

  for (const c of customerProfiles) {
    const orders = c.orderCount || 0;
    const latestDate = c.latestOrderDate ? new Date(c.latestOrderDate) : null;
    const hasRecentOrder = latestDate && latestDate >= thirtyDaysAgo;

    if (!hasRecentOrder || orders === 0) {
      segmentInactive++;
    } else if (orders === 1) {
      segmentNew++;
    } else {
      segmentReturning++;
    }
  }

  const totalSegmented = customerProfiles.length;

  return {
    range: rangeKey,
    trend,
    repeatRate,
    repeatCustomers,
    totalDistinctCustomers,
    segments: {
      total: totalSegmented,
      new: {
        count: segmentNew,
        percentage: totalSegmented > 0 ? Number(((segmentNew / totalSegmented) * 100).toFixed(1)) : 0,
      },
      returning: {
        count: segmentReturning,
        percentage: totalSegmented > 0 ? Number(((segmentReturning / totalSegmented) * 100).toFixed(1)) : 0,
      },
      inactive: {
        count: segmentInactive,
        percentage: totalSegmented > 0 ? Number(((segmentInactive / totalSegmented) * 100).toFixed(1)) : 0,
      },
    },
  };
}

/**
 * 6. GET /forecast
 * 7-day revenue forecast using a 7-day moving average.
 * Requires at least 14 days of historical data.
 */
async function getRevenueForecast() {
  const dailyHistory = await Order.aggregate([
    { $match: { status: { $ne: "Cancelled" } } },
    {
      $group: {
        _id: {
          $dateToString: {
            date: "$createdAt",
            timezone: TIMEZONE,
            format: "%Y-%m-%d",
          },
        },
        revenue: { $sum: "$total" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  if (!dailyHistory || dailyHistory.length === 0) {
    return {
      success: true,
      insufficientData: true,
      message: "At least 14 days of order history are required to generate a forecast.",
      history: [],
      forecast: [],
    };
  }

  // Calculate day span from first order to yesterday
  const firstDateStr = dailyHistory[0]._id;
  const firstDate = new Date(firstDateStr);
  const now = new Date();
  const daySpan = Math.floor((now - firstDate) / (1000 * 60 * 60 * 24));

  if (daySpan < 14 || dailyHistory.length < 5) {
    return {
      success: true,
      insufficientData: true,
      message: `Only ${daySpan} day(s) of history available. At least 14 days are required for forecasting.`,
      history: dailyHistory.map((d) => ({
        date: d._id,
        revenue: Math.round(d.revenue * 100) / 100,
        isEstimate: false,
      })),
      forecast: [],
    };
  }

  // Zero-fill daily sequence over the last 30 days
  const historyMap = new Map(dailyHistory.map((d) => [d._id, d.revenue]));
  const fullTimeline = [];

  const startCursor = new Date(now);
  startCursor.setDate(startCursor.getDate() - 30);
  const endCursor = new Date(now);
  endCursor.setDate(endCursor.getDate() - 1); // up to yesterday

  const cur = new Date(startCursor);
  while (cur <= endCursor) {
    const key = formatDateInTZ(cur);
    fullTimeline.push({
      date: key,
      revenue: Math.round((historyMap.get(key) || 0) * 100) / 100,
      isEstimate: false,
    });
    cur.setDate(cur.getDate() + 1);
  }

  // Simple exponential smoothing & 7-day moving average calculation
  const recentRevenues = fullTimeline.slice(-14).map((d) => d.revenue);
  const movingAvg7 = recentRevenues.slice(-7).reduce((a, b) => a + b, 0) / 7;

  // Day-of-week seasonality weight (optional modest multiplier)
  const forecast = [];
  const forecastCursor = new Date(now);

  for (let i = 0; i < 7; i++) {
    const forecastDateStr = formatDateInTZ(forecastCursor);
    const dayOfWeek = forecastCursor.getDay(); // 0 (Sun) or 6 (Sat)
    const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.2 : 0.95;
    const predictedRevenue = Math.max(0, Math.round(movingAvg7 * weekendMultiplier));

    forecast.push({
      date: forecastDateStr,
      predictedRevenue,
      isEstimate: true,
    });
    forecastCursor.setDate(forecastCursor.getDate() + 1);
  }

  return {
    success: true,
    insufficientData: false,
    history: fullTimeline,
    forecast,
    note: "Forecast is an algorithmic estimate based on the trailing 7-day moving average and weekend patterns.",
  };
}

module.exports = {
  parseRange,
  getSalesTrend,
  getSummary,
  getTopProducts,
  getDemandHeatmap,
  getCustomerAnalytics,
  getRevenueForecast,
};
