const express = require("express");
const crypto = require("crypto");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Menu = require("../models/Menu");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");
const { generateCheckoutHash } = require("../utils/payhere");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

// Order status transition map: defines allowed next states for each status
const VALID_TRANSITIONS = {
  "Awaiting Approval": ["Approved", "Declined", "Cancelled"],
  Approved: ["Processing", "Completed", "Cancelled"],
  Declined: [],
  Pending: ["Processing", "Shipped", "Completed", "Cancelled"],
  Processing: ["Shipped", "Completed", "Cancelled"],
  Shipped: ["Completed", "Cancelled"],
  Completed: [],
  Cancelled: [],
};

// ── Validation Helpers ────────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SL_PHONE_REGEX = /^(?:\+94|0)7[0-9]{8}$/;

/**
 * Generate human-readable unique order number: CC-YYYYMMDD-XXXXXX
 */
function generateOrderNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randSuffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `CC-${dateStr}-${randSuffix}`;
}

/**
 * Helper to dispatch acceptance or decline email to customer
 */
async function sendSpecialOrderDecisionEmail(order, decision) {
  const isAccept = decision === "accept" || decision === "Approved";
  const customerName = `${order.customer?.firstName || ""} ${order.customer?.lastName || ""}`.trim() || "Valued Customer";
  const itemsListText = (order.items || [])
    .map((item) => `- ${item.name} x ${item.quantity} (LKR ${(item.price * item.quantity).toLocaleString()})`)
    .join("\n");

  const itemsListHtml = (order.items || [])
    .map(
      (item) =>
        `<li style="margin-bottom: 6px;"><strong>${item.name}</strong> &times; ${item.quantity} &mdash; <span style="color: #c98b3b;">LKR ${(item.price * item.quantity).toLocaleString()}</span></li>`
    )
    .join("");

  if (isAccept) {
    const subject = `Your Special Order #${order.orderNumber} has been Accepted! - Chocolate Clicks`;
    const text = `Dear ${customerName},\n\nGreat news! We have reviewed your special order request (#${order.orderNumber}) and we are delighted to accept it!\n\nOrder Details:\nOrder Number: ${order.orderNumber}\nTotal: LKR ${order.total.toLocaleString()}\nFulfillment: ${order.orderType === "pickup" ? "Store Pickup" : "Delivery"}\n\nItems Ordered:\n${itemsListText}\n\nOur kitchen will begin crafting your custom bakes. If we need any additional details, our team will contact you directly at ${order.customer?.phone || "your phone number"}.\n\nThank you for choosing Chocolate Clicks!\n\nWarm regards,\nThe Chocolate Clicks Team`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #161616; color: #f3f4f6; border-radius: 10px; overflow: hidden; border: 1px solid #333;">
        <div style="background-color: #0f0f0f; padding: 24px; text-align: center; border-bottom: 2px solid #c98b3b;">
          <h1 style="color: #c98b3b; margin: 0; font-size: 24px;">Chocolate Clicks</h1>
          <p style="color: #9ca3af; margin: 6px 0 0 0; font-size: 14px;">Artisanal Café & Bakery</p>
        </div>
        <div style="padding: 24px;">
          <h2 style="color: #10b981; margin-top: 0;">Special Order Accepted!</h2>
          <p style="font-size: 15px; line-height: 1.5; color: #e5e7eb;">
            Dear <strong>${customerName}</strong>,<br/><br/>
            Great news! We have reviewed your special order request <strong>#${order.orderNumber}</strong> and we are delighted to accept it.
          </p>
          <div style="background-color: #1f1f1f; border-radius: 8px; padding: 16px; margin: 20px 0; border: 1px solid #2d2d2d;">
            <p style="margin: 0 0 10px 0;"><strong>Order Number:</strong> <span style="color: #c98b3b; font-family: monospace;">${order.orderNumber}</span></p>
            <p style="margin: 0 0 10px 0;"><strong>Total Value:</strong> LKR ${order.total.toLocaleString()}</p>
            <p style="margin: 0 0 10px 0;"><strong>Fulfillment:</strong> ${order.orderType === "pickup" ? "Store Pickup" : "Delivery"}</p>
            ${order.address ? `<p style="margin: 0 0 10px 0;"><strong>Delivery Address:</strong> ${order.address}, ${order.city}</p>` : ""}
            <div style="margin-top: 14px; border-top: 1px solid #333; padding-top: 12px;">
              <strong>Items Requested:</strong>
              <ul style="padding-left: 20px; margin: 8px 0 0 0;">
                ${itemsListHtml}
              </ul>
            </div>
          </div>
          <p style="font-size: 14px; line-height: 1.5; color: #9ca3af;">
            Our kitchen team will now begin handcrafted preparation. We will get in touch with you at <strong>${order.customer?.phone || ""}</strong> if any adjustments or schedule confirmations are required.
          </p>
          <p style="font-size: 14px; color: #e5e7eb; margin-top: 24px;">
            Warm regards,<br/><strong>The Chocolate Clicks Team</strong>
          </p>
        </div>
      </div>
    `;

    return sendEmail({ email: order.customer.email, subject, text, html });
  } else {
    const subject = `Update regarding your Special Order #${order.orderNumber} - Chocolate Clicks`;
    const text = `Dear ${customerName},\n\nThank you for choosing Chocolate Clicks and requesting special order #${order.orderNumber}.\n\nAfter careful review of our kitchen capacity and current orders, we regret that we are unable to fulfill your custom request at this time. We sincerely apologize for any inconvenience.\n\nYou are always welcome to place orders from our daily menu or contact our store for future event bakes.\n\nWarm regards,\nThe Chocolate Clicks Team`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #161616; color: #f3f4f6; border-radius: 10px; overflow: hidden; border: 1px solid #333;">
        <div style="background-color: #0f0f0f; padding: 24px; text-align: center; border-bottom: 2px solid #c98b3b;">
          <h1 style="color: #c98b3b; margin: 0; font-size: 24px;">Chocolate Clicks</h1>
          <p style="color: #9ca3af; margin: 6px 0 0 0; font-size: 14px;">Artisanal Café & Bakery</p>
        </div>
        <div style="padding: 24px;">
          <h2 style="color: #ef4444; margin-top: 0;">Special Order Update</h2>
          <p style="font-size: 15px; line-height: 1.5; color: #e5e7eb;">
            Dear <strong>${customerName}</strong>,<br/><br/>
            Thank you for your interest in Chocolate Clicks and for submitting special order request <strong>#${order.orderNumber}</strong>.
          </p>
          <div style="background-color: #1f1f1f; border-radius: 8px; padding: 16px; margin: 20px 0; border: 1px solid #2d2d2d;">
            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #d1d5db;">
              After reviewing our kitchen capacity, we regret that we are unable to accept your custom high-quantity order at this time. We truly appreciate your understanding and apologize for any inconvenience.
            </p>
          </div>
          <p style="font-size: 14px; line-height: 1.5; color: #9ca3af;">
            You are always welcome to explore our daily in-stock menu on our website or visit our bakery in person.
          </p>
          <p style="font-size: 14px; color: #e5e7eb; margin-top: 24px;">
            Warm regards,<br/><strong>The Chocolate Clicks Team</strong>
          </p>
        </div>
      </div>
    `;

    return sendEmail({ email: order.customer.email, subject, text, html });
  }
}

// @route   POST /api/orders
// @desc    Create a new order. If any item quantity exceeds maxPerOrder, it becomes a SPECIAL ORDER.
// @access  Private (Logged-in user)
router.post("/", protect, async (req, res) => {
  try {
    const { items, customer, orderType, address, city, notes } = req.body;

    // 1. Validate items
    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Order items must be a non-empty array with at most 50 items",
      });
    }

    for (const item of items) {
      if (!item || !item.menuItemId || !mongoose.Types.ObjectId.isValid(item.menuItemId)) {
        return res.status(400).json({
          success: false,
          message: `Invalid menuItemId: ${item ? item.menuItemId : "undefined"}`,
        });
      }
      const qty = Number(item.quantity);
      if (!Number.isInteger(qty) || qty < 1 || qty > 1000) {
        return res.status(400).json({
          success: false,
          message: "Item quantity must be a positive integer",
        });
      }
    }

    // 2. Validate customer
    if (!customer || typeof customer !== "object") {
      return res.status(400).json({
        success: false,
        message: "Customer details are required",
      });
    }

    const firstName = String(customer.firstName || "").trim();
    const lastName = String(customer.lastName || "").trim();
    const email = String(customer.email || "").trim().toLowerCase();
    const rawPhone = String(customer.phone || "").trim();
    const cleanPhone = rawPhone.replace(/[\s-]/g, "");

    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "Customer first name and last name are required",
      });
    }

    if (!email || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        success: false,
        message: "A valid customer email is required",
      });
    }

    if (!cleanPhone || !SL_PHONE_REGEX.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message:
          "A valid Sri Lankan phone number is required (e.g. 07XXXXXXXX or +947XXXXXXXX)",
      });
    }

    // 3. Validate order type & address
    const normalizedType = String(orderType || "").trim().toLowerCase();
    if (!["pickup", "delivery"].includes(normalizedType)) {
      return res.status(400).json({
        success: false,
        message: 'Order type must be either "pickup" or "delivery"',
      });
    }

    const cleanAddress = String(address || "").trim();
    const cleanCity = String(city || "").trim();

    if (normalizedType === "delivery") {
      if (!cleanAddress || !cleanCity) {
        return res.status(400).json({
          success: false,
          message: "Address and city are required for delivery orders",
        });
      }
    }

    // 4. Fetch menu items from database and verify stock, pricing, and maxPerOrder
    const itemIds = items.map((i) => i.menuItemId);
    const dbMenuItems = await Menu.find({ _id: { $in: itemIds } });
    const menuMap = new Map(dbMenuItems.map((m) => [m._id.toString(), m]));

    let calculatedTotal = 0;
    let isSpecialOrder = false;
    const orderItems = [];

    for (const item of items) {
      const dbItem = menuMap.get(String(item.menuItemId));
      if (!dbItem) {
        return res.status(400).json({
          success: false,
          message: `Menu item not found: ${item.menuItemId}`,
        });
      }

      if (dbItem.inStock === false || dbItem.isActive === false) {
        return res.status(400).json({
          success: false,
          message: `Item is currently unavailable: ${dbItem.name}`,
        });
      }

      const unitPrice = Number(dbItem.price);
      const qty = Number(item.quantity);
      calculatedTotal += unitPrice * qty;

      const itemMax = typeof dbItem.maxPerOrder === "number" && dbItem.maxPerOrder > 0 ? dbItem.maxPerOrder : 10;
      if (qty > itemMax) {
        isSpecialOrder = true;
      }

      orderItems.push({
        menuItem: dbItem._id,
        name: dbItem.name,
        price: unitPrice,
        quantity: qty,
      });
    }

    // 5. Generate unique orderNumber and persist Order
    let orderNumber = generateOrderNumber();
    while (await Order.exists({ orderNumber })) {
      orderNumber = generateOrderNumber();
    }

    const orderStatus = isSpecialOrder ? "Awaiting Approval" : "Pending";
    const orderCategoryType = isSpecialOrder ? "special" : "normal";

    const order = await Order.create({
      user: req.user.id,
      orderNumber,
      type: orderCategoryType,
      items: orderItems,
      total: calculatedTotal,
      currency: "LKR",
      customer: {
        firstName,
        lastName,
        email,
        phone: cleanPhone,
      },
      orderType: normalizedType,
      address: normalizedType === "delivery" ? cleanAddress : "",
      city: normalizedType === "delivery" ? cleanCity : "",
      notes: notes ? String(notes).trim() : "",
      paymentStatus: "pending",
      status: orderStatus,
    });

    // 6. If Special Order: Skip PayHere step and return confirmation immediately
    if (isSpecialOrder) {
      return res.status(201).json({
        success: true,
        orderId: order._id,
        orderNumber: order.orderNumber,
        type: "special",
        status: "Awaiting Approval",
        message:
          "Special order placed successfully. The owner will review your request and email you if it's accepted.",
      });
    }

    // 7. Normal Order: Build PayHere parameters
    const merchantId = process.env.PAYHERE_MERCHANT_ID || "";
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || "";
    const isSandbox = process.env.PAYHERE_SANDBOX !== "false";
    const actionUrl = isSandbox
      ? "https://sandbox.payhere.lk/pay/checkout"
      : "https://www.payhere.lk/pay/checkout";

    const amountStr = calculatedTotal.toFixed(2);
    const currency = "LKR";

    const hash = generateCheckoutHash({
      merchantId,
      orderId: order.orderNumber,
      amount: amountStr,
      currency,
      merchantSecret,
    });

    const itemsSummary = orderItems
      .map((i) => `${i.name} x${i.quantity}`)
      .join(", ")
      .slice(0, 150);

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const backendPublicUrl = process.env.BACKEND_PUBLIC_URL || "http://localhost:5000";

    const params = {
      merchant_id: merchantId,
      return_url: `${frontendUrl}/order/success?orderId=${order._id}`,
      cancel_url: `${frontendUrl}/order/cancelled?orderId=${order._id}`,
      notify_url: `${backendPublicUrl}/api/payhere/notify`,
      order_id: order.orderNumber,
      items: itemsSummary || "Chocolate Clicks Order",
      currency,
      amount: amountStr,
      first_name: order.customer.firstName,
      last_name: order.customer.lastName,
      email: order.customer.email,
      phone: order.customer.phone,
      address: normalizedType === "delivery" ? order.address : "Pickup",
      city: normalizedType === "delivery" ? order.city : "Pickup",
      country: "Sri Lanka",
      custom_1: order._id.toString(),
      hash,
    };

    res.status(201).json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      type: "normal",
      actionUrl,
      params,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to create order" });
  }
});

// @route   GET /api/orders
// @desc    Get all orders with optional status/type filter, search, and pagination
// @access  Private (Admin only)
router.get("/", protect, authorize("admin"), async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const skip = (page - 1) * limit;

    const query = {};

    // Filter by order category type: "special" or "normal"
    if (req.query.type) {
      if (req.query.type.toLowerCase() === "special") {
        query.type = "special";
      } else if (req.query.type.toLowerCase() === "normal") {
        query.type = { $ne: "special" };
      }
    }

    // Filter by status if provided (and not 'all')
    if (req.query.status && req.query.status.toLowerCase() !== "all") {
      const statusParam = req.query.status.trim();
      if (statusParam.toLowerCase() === "special") {
        query.type = "special";
      } else {
        query.status = { $regex: new RegExp(`^${statusParam}$`, "i") };
      }
    }

    // Search by order ID or customer details
    if (req.query.search && req.query.search.trim()) {
      const searchRegex = new RegExp(req.query.search.trim(), "i");
      query.$or = [
        { orderNumber: searchRegex },
        { "customer.firstName": searchRegex },
        { "customer.lastName": searchRegex },
        { "customer.email": searchRegex },
      ];
    }

    const [total, orders] = await Promise.all([
      Order.countDocuments(query),
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("items.menuItem", "imageUrl category maxPerOrder"),
    ]);

    res.status(200).json({
      success: true,
      orders,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
        limit,
      },
    });
  } catch (error) {
    console.error("Fetch admin orders error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to fetch orders" });
  }
});

// @route   PATCH /api/orders/:id/decision
// @desc    Accept or decline a special order and send customer notification email
// @access  Private (Admin only)
router.patch("/:id/decision", protect, authorize("admin"), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const { decision } = req.body;
    const normalizedDecision = String(decision || "").toLowerCase().trim();

    if (!["accept", "decline", "approved", "declined"].includes(normalizedDecision)) {
      return res.status(400).json({
        success: false,
        message: 'Decision must be either "accept" or "decline"',
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const isAccept = normalizedDecision === "accept" || normalizedDecision === "approved";
    order.status = isAccept ? "Approved" : "Declined";
    await order.save();

    // Send email notification to customer (gracefully handled so failures do not abort update)
    let emailSent = false;
    let emailError = null;
    try {
      await sendSpecialOrderDecisionEmail(order, isAccept ? "accept" : "decline");
      emailSent = true;
    } catch (mailErr) {
      console.error("Special order decision email delivery failed:", mailErr);
      emailError = mailErr.message;
    }

    res.status(200).json({
      success: true,
      message: `Special order #${order.orderNumber} ${isAccept ? "accepted" : "declined"} successfully.`,
      order,
      emailSent,
      emailError,
    });
  } catch (error) {
    console.error("Special order decision error:", error);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
});

// @route   GET /api/orders/summary
// @desc    Get order & customer summary counts via MongoDB aggregation
// @access  Private (Admin only)
router.get("/summary", protect, authorize("admin"), async (req, res) => {
  try {
    const orderAggResults = await Order.aggregate([
      {
        $addFields: {
          normalizedStatus: { $ifNull: ["$status", "Pending"] },
        },
      },
      {
        $facet: {
          totalOrders: [{ $count: "count" }],
          completedOrders: [
            { $match: { normalizedStatus: "Completed" } },
            { $count: "count" },
          ],
          pendingOrders: [
            { $match: { normalizedStatus: { $in: ["Pending", "Processing", "Shipped", "Awaiting Approval"] } } },
            { $count: "count" },
          ],
          cancelledOrders: [
            { $match: { normalizedStatus: { $in: ["Cancelled", "Declined"] } } },
            { $count: "count" },
          ],
          specialOrders: [
            { $match: { type: "special" } },
            { $count: "count" },
          ],
          revenue: [
            { $match: { normalizedStatus: { $nin: ["Cancelled", "Declined"] } } },
            { $group: { _id: null, total: { $sum: "$total" } } },
          ],
          customerStats: [
            { $match: { normalizedStatus: { $nin: ["Cancelled", "Declined"] } } },
            { $group: { _id: "$user", customerTotal: { $sum: "$total" } } },
            {
              $group: {
                _id: null,
                activeCustomerCount: { $sum: 1 },
                customerRevenue: { $sum: "$customerTotal" },
              },
            },
          ],
        },
      },
    ]);

    const facet = orderAggResults[0] || {};
    const totalOrders = facet.totalOrders?.[0]?.count || 0;
    const completedOrders = facet.completedOrders?.[0]?.count || 0;
    const pendingOrders = facet.pendingOrders?.[0]?.count || 0;
    const cancelledOrders = facet.cancelledOrders?.[0]?.count || 0;
    const specialOrders = facet.specialOrders?.[0]?.count || 0;
    const totalRevenue = facet.revenue?.[0]?.total || 0;

    const totalCustomers = await User.countDocuments({ role: { $ne: "admin" } });
    const activeCustomers = facet.customerStats?.[0]?.activeCustomerCount || 0;
    const inactiveCustomers = Math.max(0, totalCustomers - activeCustomers);
    const customerRevenue = facet.customerStats?.[0]?.customerRevenue || totalRevenue;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("items.menuItem", "imageUrl category");

    res.status(200).json({
      success: true,
      orderSummary: {
        totalOrders,
        completedOrders,
        pendingOrders,
        cancelledOrders,
        specialOrders,
        totalRevenue,
      },
      customerSummary: {
        totalCustomers,
        activeCustomers,
        inactiveCustomers,
        avgOrderValue,
        customerRevenue,
      },
      recentOrders,
    });
  } catch (error) {
    console.error("Order summary aggregation error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to calculate summary" });
  }
});

// @route   GET /api/orders/mine
// @desc    Get all orders belonging to the logged-in user (newest first)
// @access  Private
router.get("/mine", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("items.menuItem", "imageUrl category");

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Fetch user orders error:", error);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID (only if owned by logged-in user or user is admin)
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const order = await Order.findById(req.params.id).populate(
      "items.menuItem",
      "imageUrl category"
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const isOwner = order.user.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Fetch order by id error:", error);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
});

// @route   PATCH /api/orders/:id/status
// @desc    Update order status with transition validation (admin only)
// @access  Private (Admin only)
router.patch("/:id/status", protect, authorize("admin"), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const { status: newStatus } = req.body;
    const validStatuses = Object.keys(VALID_TRANSITIONS);

    if (!newStatus || !validStatuses.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const currentStatus = order.status || "Pending";

    if (currentStatus === newStatus) {
      return res.status(200).json({ success: true, order });
    }

    const allowedNextStatuses = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowedNextStatuses.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition: "${currentStatus}" cannot be changed to "${newStatus}".`,
      });
    }

    order.status = newStatus;
    await order.save();

    // If changing a special order to Approved or Declined, trigger notification email
    if (order.type === "special" && (newStatus === "Approved" || newStatus === "Declined")) {
      try {
        await sendSpecialOrderDecisionEmail(order, newStatus === "Approved" ? "accept" : "decline");
      } catch (err) {
        console.error("Email notification failed during status change:", err);
      }
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to ${newStatus}`,
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
});

module.exports = router;
