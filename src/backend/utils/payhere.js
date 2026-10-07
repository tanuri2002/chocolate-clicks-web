const crypto = require("crypto");

/**
 * Calculates MD5 hash of string in hex format
 */
function md5(str) {
  return crypto.createHash("md5").update(String(str)).digest("hex");
}

/**
 * Generates PayHere checkout hash.
 * Formula: MD5( merchant_id + order_id + amount + currency + MD5(merchant_secret).toUpperCase() ).toUpperCase()
 *
 * @param {Object} params
 * @param {string} params.merchantId - Merchant ID
 * @param {string} params.orderId - Human-readable unique order number (e.g. CC-20261004-ABC123)
 * @param {string} params.amount - Amount formatted to 2 decimals (e.g. "1850.00")
 * @param {string} params.currency - e.g. "LKR"
 * @param {string} params.merchantSecret - Merchant Secret from environment
 * @returns {string} Uppercase MD5 hash
 */
function generateCheckoutHash({ merchantId, orderId, amount, currency, merchantSecret }) {
  if (!merchantId || !orderId || !amount || !currency || !merchantSecret) {
    throw new Error("Missing required parameters for generateCheckoutHash");
  }
  const hashedSecret = md5(merchantSecret).toUpperCase();
  const raw = `${merchantId}${orderId}${amount}${currency}${hashedSecret}`;
  return md5(raw).toUpperCase();
}

/**
 * Verifies the incoming PayHere server-to-server notification signature using constant-time comparison.
 * Formula: MD5( merchant_id + order_id + payhere_amount + payhere_currency + status_code + MD5(merchant_secret).toUpperCase() ).toUpperCase()
 *
 * @param {Object} params
 * @param {string} params.merchantId - Merchant ID from notification
 * @param {string} params.orderId - Order ID / order number from notification
 * @param {string} params.payhereAmount - Amount string from notification (e.g. "1850.00")
 * @param {string} params.payhereCurrency - Currency from notification (e.g. "LKR")
 * @param {string|number} params.statusCode - Status code from notification (e.g. "2")
 * @param {string} params.md5sig - Signature received from PayHere
 * @param {string} params.merchantSecret - Merchant Secret from environment
 * @returns {boolean} True if signature matches
 */
function verifyNotifySignature({
  merchantId,
  orderId,
  payhereAmount,
  payhereCurrency,
  statusCode,
  md5sig,
  merchantSecret,
}) {
  if (!merchantId || !orderId || !payhereAmount || !payhereCurrency || statusCode === undefined || !md5sig || !merchantSecret) {
    return false;
  }

  const hashedSecret = md5(merchantSecret).toUpperCase();
  const raw = `${merchantId}${orderId}${payhereAmount}${payhereCurrency}${statusCode}${hashedSecret}`;
  const expectedSig = md5(raw).toUpperCase();

  const bufReceived = Buffer.from(String(md5sig).toUpperCase(), "utf8");
  const bufExpected = Buffer.from(expectedSig, "utf8");

  if (bufReceived.length !== bufExpected.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufReceived, bufExpected);
}

module.exports = {
  generateCheckoutHash,
  verifyNotifySignature,
};
