/**
 * Helper script to simulate a PayHere Server-to-Server IPN Notification
 * Usage:
 *   node src/backend/scripts/simulatePayHereNotify.js [ORDER_NUMBER] [STATUS_CODE]
 *
 * Examples:
 *   node src/backend/scripts/simulatePayHereNotify.js                      (picks most recent pending order, status 2)
 *   node src/backend/scripts/simulatePayHereNotify.js CC-20261004-A1B2C3 2 (simulates success payment)
 *   node src/backend/scripts/simulatePayHereNotify.js CC-20261004-A1B2C3 -2 (simulates failed payment)
 */

const path = require("path");
const crypto = require("crypto");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: path.join(__dirname, "../.env") });

const Order = require("../models/Order");
const connectDB = require("../config/db");

function md5(str) {
  return crypto.createHash("md5").update(String(str)).digest("hex");
}

function calculateNotifySignature(merchantId, orderId, payhereAmount, payhereCurrency, statusCode, merchantSecret) {
  const hashedSecret = md5(merchantSecret).toUpperCase();
  const raw = `${merchantId}${orderId}${payhereAmount}${payhereCurrency}${statusCode}${hashedSecret}`;
  return md5(raw).toUpperCase();
}

async function run() {
  await connectDB();

  const targetOrderNumber = process.argv[2];
  const statusCode = process.argv[3] || "2";

  let order;
  if (targetOrderNumber) {
    order = await Order.findOne({ orderNumber: targetOrderNumber });
    if (!order) {
      console.error(`❌ Order not found with orderNumber: ${targetOrderNumber}`);
      process.exit(1);
    }
  } else {
    order = await Order.findOne().sort({ createdAt: -1 });
    if (!order) {
      console.error("❌ No orders found in database. Create an order first via POST /api/orders.");
      process.exit(1);
    }
  }

  const merchantId = process.env.PAYHERE_MERCHANT_ID || "1211149";
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || "your_payhere_merchant_secret";
  const amountStr = order.total.toFixed(2);
  const currency = order.currency || "LKR";
  const paymentId = "PAYHERE_" + Date.now();

  const md5sig = calculateNotifySignature(
    merchantId,
    order.orderNumber,
    amountStr,
    currency,
    statusCode,
    merchantSecret
  );

  console.log("\n📦 Simulating PayHere IPN Notification for:");
  console.log(`   Order Number : ${order.orderNumber}`);
  console.log(`   Total Amount : ${currency} ${amountStr}`);
  console.log(`   Status Code  : ${statusCode} (Mapping: ${statusCode === "2" ? "paid" : statusCode === "-2" ? "failed" : statusCode === "-1" ? "cancelled" : "other"})`);
  console.log(`   Computed Sig : ${md5sig}`);

  const postBody = new URLSearchParams({
    merchant_id: merchantId,
    order_id: order.orderNumber,
    payment_id: paymentId,
    payhere_amount: amountStr,
    payhere_currency: currency,
    status_code: String(statusCode),
    md5sig: md5sig,
    custom_1: order._id.toString(),
    method: "TEST_VISA",
    status_message: "Successfully processed by simulator",
  });

  const backendUrl = process.env.BACKEND_PUBLIC_URL || "http://localhost:5000";
  const notifyUrl = `${backendUrl}/api/payhere/notify`;

  console.log(`\n🚀 Sending POST request to ${notifyUrl}...`);

  try {
    const response = await fetch(notifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: postBody.toString(),
    });

    const responseText = await response.text();
    console.log(`📥 Response Status: ${response.status} ${response.statusText}`);
    console.log(`📥 Response Body  : ${responseText}`);

    // Check updated order in DB
    const updated = await Order.findById(order._id);
    console.log(`\n✨ Order ${updated.orderNumber} current paymentStatus: [ ${updated.paymentStatus.toUpperCase()} ]`);
  } catch (err) {
    console.error("❌ Failed to send request:", err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

run();
