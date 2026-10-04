#!/usr/bin/env node
/**
 * Diagnostic script: shows what PayHere checkout hash is generated
 * and what exact params are sent to PayHere.
 * Run: node src/backend/scripts/debugPayhereHash.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const crypto = require("crypto");

const merchantId   = process.env.PAYHERE_MERCHANT_ID   || "";
const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || "";
const isSandbox    = process.env.PAYHERE_SANDBOX !== "false";

console.log("\n══════════════════════════════════════════");
console.log("PayHere Hash Diagnostic");
console.log("══════════════════════════════════════════");
console.log(`PAYHERE_SANDBOX      : ${isSandbox}`);
console.log(`PAYHERE_MERCHANT_ID  : "${merchantId}"`);
console.log(`PAYHERE_MERCHANT_SECRET length: ${merchantSecret.length}`);
console.log(`PAYHERE_MERCHANT_SECRET first 6 chars: "${merchantSecret.slice(0, 6)}..."`);

// Check if secret looks Base64-encoded (PayHere secrets are raw alphanumeric, not Base64)
const isBase64 = /^[A-Za-z0-9+/]+=*$/.test(merchantSecret) &&
                 merchantSecret.length > 20;
if (isBase64) {
  const decoded = Buffer.from(merchantSecret, "base64").toString("utf8");
  console.log("\n⚠️  WARNING: Your PAYHERE_MERCHANT_SECRET looks like it might be Base64-encoded.");
  console.log(`   Decoded value: "${decoded.slice(0, 20)}..."`);
  console.log("   If the decoded value looks like a number or alphanumeric string,");
  console.log("   you should use the DECODED value as your PAYHERE_MERCHANT_SECRET in .env\n");
}

function md5(str) {
  return crypto.createHash("md5").update(String(str)).digest("hex");
}

// Test hash calculation with a sample order
const testOrderId = "CC-20261004-ABCDEF";
const testAmount  = "1850.00";
const testCurrency = "LKR";

const hashedSecret = md5(merchantSecret).toUpperCase();
const raw = `${merchantId}${testOrderId}${testAmount}${testCurrency}${hashedSecret}`;
const hash = md5(raw).toUpperCase();

console.log("── Test hash calculation ──────────────────");
console.log(`  Merchant ID      : "${merchantId}"`);
console.log(`  Order ID         : "${testOrderId}"`);
console.log(`  Amount           : "${testAmount}"`);
console.log(`  Currency         : "${testCurrency}"`);
console.log(`  MD5(secret).upper: "${hashedSecret}"`);
console.log(`  Raw string       : "${raw.slice(0, 60)}..."`);
console.log(`  Final hash       : "${hash}"`);

console.log("\n── What PayHere expects ───────────────────");
console.log("  Formula: MD5( merchant_id + order_id + amount + currency + MD5(secret).toUpper() ).toUpper()");
console.log(`  Action URL: ${isSandbox ? "https://sandbox.payhere.lk/pay/checkout" : "https://www.payhere.lk/pay/checkout"}`);

console.log("\n── Common causes of 'Unauthorized payment request' ──");
console.log("  1. PAYHERE_MERCHANT_ID doesn't match your sandbox account");
console.log("  2. PAYHERE_MERCHANT_SECRET is wrong (Base64-encoded instead of raw)");
console.log("  3. The domain (localhost:5173) is not whitelisted in PayHere sandbox merchant portal");
console.log("  4. Amount/currency mismatch between hash and form field");
console.log("\n══════════════════════════════════════════\n");
