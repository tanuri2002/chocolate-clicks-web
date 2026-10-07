import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Payment.css";

// ─── PayHere Config ───────────────────────────────────────────────
// TODO: Replace with your Merchant ID from payhere.lk dashboard
const PAYHERE_MERCHANT_ID = "YOUR_MERCHANT_ID";
const PAYHERE_MODE = "sandbox"; // change to "www" when going live
// ─────────────────────────────────────────────────────────────────

export default function Payment({ cart = {}, onClearCart }) {
  const navigate = useNavigate();
  const cartItems = Object.values(cart);

  const [billing, setBilling] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "Colombo",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ── Order calculations ───────────────────────────────────────────
  const subtotal = cartItems.reduce((s, it) => s + it.price * it.qty, 0);
  const deliveryFee = cartItems.length > 0 ? 500 : 0;
  const discount = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee - discount;

  // ── Helpers ──────────────────────────────────────────────────────
  function handleChange(e) {
    const { name, value } = e.target;
    setBilling((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate() {
    const e = {};
    if (!billing.firstName.trim()) e.firstName = "First name is required";
    if (!billing.lastName.trim()) e.lastName = "Last name is required";
    if (!billing.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(billing.email)) e.email = "Invalid email";
    if (!billing.phone.trim()) e.phone = "Phone number is required";
    if (!billing.address.trim()) e.address = "Address is required";
    return e;
  }

  // ── PayHere payment trigger ──────────────────────────────────────
  function handlePayNow() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    // Make sure PayHere script is loaded
    if (!window.payhere) {
      alert("PayHere is not loaded. Please check your internet connection.");
      return;
    }

    setLoading(true);
    const orderId = "CC-" + Date.now();

    // PayHere amount must be a decimal string e.g. "1500.00"
    // cart prices are in LKR (whole numbers), total is already LKR
    const payment = {
      sandbox: PAYHERE_MODE === "sandbox",
      merchant_id: PAYHERE_MERCHANT_ID,

      // These URLs must be absolute
      return_url: window.location.origin + "/confirmation",
      cancel_url: window.location.origin + "/payment",
      notify_url: "https://your-backend.com/payhere/notify", // TODO: replace with your server endpoint

      order_id: orderId,
      items: cartItems.map((i) => `${i.name} x${i.qty}`).join(", "),
      amount: total.toFixed(2),
      currency: "LKR",

      // Customer details from billing form
      first_name: billing.firstName,
      last_name: billing.lastName,
      email: billing.email,
      phone: billing.phone,
      address: billing.address,
      city: billing.city,
      country: "Sri Lanka",
    };

    // ── Callbacks ──────────────────────────────────────────────────
    window.payhere.onCompleted = function (id) {
      console.log("Payment completed. OrderID:", id);
      setLoading(false);
      if (onClearCart) onClearCart(); // wipe the cart
      navigate("/confirmation");
    };

    window.payhere.onDismissed = function () {
      console.log("Payment dismissed by user.");
      setLoading(false);
    };

    window.payhere.onError = function (error) {
      console.error("PayHere error:", error);
      setLoading(false);
      alert("Payment failed. Please try again.");
    };

    window.payhere.startPayment(payment);
  }

  return (
    <div className="payment-container">
      {/* Header */}
      <header className="payment-header">
        <div className="header-content">
          <div className="logo-section">
            <img src="/front_img/logo.jpeg" alt="Chocolate Clicks" className="logo" />
            <h1>Chocolate Clicks</h1>
          </div>
          <h2 className="page-title">Secure Payment</h2>
        </div>

        <div className="steps-indicator">
          {["Cart", "Delivery", "Payment", "Confirmation"].map((s, i) => (
            <React.Fragment key={s}>
              <div className={`step ${i < 2 ? "completed" : i === 2 ? "active" : ""}`}>
                <span className="step-number">{i + 1}</span>
                <p>{s}</p>
              </div>
              {i < 3 && <div className="step-line" />}
            </React.Fragment>
          ))}
        </div>
      </header>

      <div className="payment-main">
        {/* Left: Billing Form */}
        <div className="payment-content">

          {/* PayHere info banner */}
          <div className="payhere-banner">
            <div className="payhere-banner-left">
              <span className="payhere-icon">🔐</span>
              <div>
                <h4>Powered by PayHere</h4>
                <p>You'll be redirected to PayHere's secure page to complete payment.</p>
              </div>
            </div>
            <div className="payhere-methods">
              <span>VISA</span>
              <span>MC</span>
              <span>AMEX</span>
              <span>Genie</span>
              <span>FriMi</span>
            </div>
          </div>

          {/* Billing Details */}
          <section className="payment-section">
            <h3 className="section-title">Billing Details</h3>

            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Kasun"
                  value={billing.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? "input-error" : ""}
                />
                {errors.firstName && <span className="error-msg">{errors.firstName}</span>}
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Perera"
                  value={billing.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? "input-error" : ""}
                />
                {errors.lastName && <span className="error-msg">{errors.lastName}</span>}
              </div>
            </div>

            <div className="form-group full">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="kasun@example.com"
                value={billing.email}
                onChange={handleChange}
                className={errors.email ? "input-error" : ""}
              />
              {errors.email && <span className="error-msg">{errors.email}</span>}
            </div>

            <div className="form-group full">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="077 123 4567"
                value={billing.phone}
                onChange={handleChange}
                className={errors.phone ? "input-error" : ""}
              />
              {errors.phone && <span className="error-msg">{errors.phone}</span>}
            </div>

            <div className="form-group full">
              <label>Delivery Address</label>
              <textarea
                name="address"
                placeholder="No. 12, Main Street, Colombo 03"
                value={billing.address}
                onChange={handleChange}
                rows="3"
                className={errors.address ? "input-error" : ""}
              />
              {errors.address && <span className="error-msg">{errors.address}</span>}
            </div>

            <div className="form-group full">
              <label>City</label>
              <input
                type="text"
                name="city"
                placeholder="Colombo"
                value={billing.city}
                onChange={handleChange}
              />
            </div>
          </section>

          <div className="security-note">
            <span>🔒</span>
            <p>Your payment is processed securely by PayHere — we never store your card details.</p>
          </div>
        </div>

        {/* Right: Order Summary */}
        <aside className="order-summary-panel">
          <h3>Order Summary</h3>

          <div className="order-items">
            {cartItems.length === 0 ? (
              <p className="empty-cart-note">Your cart is empty.</p>
            ) : (
              cartItems.map((item) => (
                <div className="order-item" key={item.id}>
                  <img src={item.img} alt={item.name} />
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p className="quantity">Qty: {item.qty}</p>
                  </div>
                  <span className="item-price">LKR {(item.price * item.qty).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>

          <div className="summary-divider" />

          <div className="summary-details">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>LKR {subtotal.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Fee</span>
              <span>LKR {deliveryFee.toLocaleString()}</span>
            </div>
            <div className="summary-row discount">
              <span>5% Member Discount</span>
              <span>− LKR {discount.toLocaleString()}</span>
            </div>
          </div>

          <div className="summary-divider" />

          <div className="summary-total">
            <span>Total</span>
            <span className="total-amount">LKR {total.toLocaleString()}</span>
          </div>

          <div className="action-buttons">
            <button
              className="btn-primary"
              onClick={handlePayNow}
              disabled={loading || cartItems.length === 0}
            >
              {loading ? "Redirecting to PayHere…" : `Pay LKR ${total.toLocaleString()}`}
            </button>
            <button className="btn-secondary" onClick={() => navigate("/cart")}>
              ← Back to Cart
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}