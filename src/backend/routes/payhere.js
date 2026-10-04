const express = require("express");
const Order = require("../models/Order");
const { verifyNotifySignature } = require("../utils/payhere");

const router = express.Router();

// Ensure urlencoded body parsing is enabled for PayHere IPN notifications
router.use(express.urlencoded({ extended: true }));

// @route   POST /api/payhere/notify
// @desc    PayHere server-to-server IPN payment notification
// @access  Public (Called directly by PayHere servers)
router.post("/notify", async (req, res) => {
  try {
    const {
      merchant_id,
      order_id,
      payment_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      method,
      status_message,
      custom_1,
    } = req.body;

    const ourMerchantId = process.env.PAYHERE_MERCHANT_ID || "";
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || "";

    // 1. Verify merchant_id matches ours
    if (!merchant_id || merchant_id !== ourMerchantId) {
      console.warn(`[PayHere Notify] Invalid merchant_id received: ${merchant_id}`);
      return res.status(400).send("Invalid merchant_id");
    }

    // 2. Verify signature using timingSafeEqual
    const isValidSignature = verifyNotifySignature({
      merchantId: merchant_id,
      orderId: order_id,
      payhereAmount: payhere_amount,
      payhereCurrency: payhere_currency,
      statusCode: status_code,
      md5sig,
      merchantSecret,
    });

    if (!isValidSignature) {
      console.warn(`[PayHere Notify] Signature verification failed for order_id: ${order_id}`);
      return res.status(400).send("Invalid signature");
    }

    // 3. Find the order by orderNumber (order_id in PayHere)
    const order = await Order.findOne({ orderNumber: order_id });
    if (!order) {
      console.warn(`[PayHere Notify] Order not found for orderNumber: ${order_id}`);
      return res.status(404).send("Order not found");
    }

    // 4. Verify amount and currency
    const expectedAmount = order.total.toFixed(2);
    const expectedCurrency = order.currency;

    if (
      Number(payhere_amount).toFixed(2) !== expectedAmount ||
      payhere_currency !== expectedCurrency
    ) {
      console.warn(
        `[PayHere Notify] Amount/currency mismatch for order ${order_id}: ` +
          `Expected ${expectedCurrency} ${expectedAmount}, received ${payhere_currency} ${payhere_amount}`
      );
      return res.status(400).send("Amount or currency mismatch");
    }

    // 5. Map status_code
    // 2 -> "paid", 0 -> keep "pending", -1 -> "cancelled", -2 -> "failed", -3 -> "chargedback"
    const statusNum = Number(status_code);
    let mappedStatus = null;
    if (statusNum === 2) {
      mappedStatus = "paid";
    } else if (statusNum === 0) {
      mappedStatus = "pending";
    } else if (statusNum === -1) {
      mappedStatus = "cancelled";
    } else if (statusNum === -2) {
      mappedStatus = "failed";
    } else if (statusNum === -3) {
      mappedStatus = "chargedback";
    }

    // 6. Idempotency & downgrade protection:
    // Never downgrade an order that is already "paid" unless it's chargedback
    if (order.paymentStatus === "paid" && mappedStatus !== "chargedback") {
      console.log(`[PayHere Notify] Order ${order.orderNumber} is already marked as paid. Preserving paid status.`);
    } else if (mappedStatus) {
      order.paymentStatus = mappedStatus;
    }

    // 7. Store PayHere details
    order.payhere = {
      paymentId: payment_id ? String(payment_id) : (order.payhere?.paymentId || ""),
      statusCode: statusNum,
      method: method ? String(method) : (order.payhere?.method || ""),
      statusMessage: status_message ? String(status_message) : (order.payhere?.statusMessage || ""),
    };

    await order.save();

    console.log(
      `[PayHere Notify] Order ${order.orderNumber} successfully updated to status: ${order.paymentStatus} (Payment ID: ${payment_id || "N/A"})`
    );

    // 8. Always respond 200 OK quickly
    return res.status(200).send("OK");
  } catch (error) {
    console.error("[PayHere Notify] Server error processing notification:", error);
    return res.status(500).send("Internal server error");
  }
});

module.exports = router;
