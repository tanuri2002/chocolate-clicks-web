import React, { useState } from "react";
import "./Payment.css";

export default function Payment() {
  const [selectedPayment, setSelectedPayment] = useState("card");
  const [selectedCardType, setSelectedCardType] = useState("visa");
  const [cardDetails, setCardDetails] = useState({
    name: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });
  const [billingDetails, setBillingDetails] = useState({
    fullName: "",
    phone: "",
    address: "",
  });

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardDetails({ ...cardDetails, [name]: value });
  };

  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingDetails({ ...billingDetails, [name]: value });
  };

  return (
    <div className="payment-container">
      {/* Header Section */}
      <header className="payment-header">
        <div className="header-content">
          <div className="logo-section">
            <img src="/front_img/logo.jpeg" alt="Chocolate Clicks" className="logo" />
            <h1>Chocolate Clicks</h1>
          </div>
          <h2 className="page-title">Secure Payment</h2>
        </div>

        {/* Step Indicator */}
        <div className="steps-indicator">
          <div className="step completed">
            <span className="step-number">1</span>
            <p>Cart</p>
          </div>
          <div className="step-line"></div>
          <div className="step completed">
            <span className="step-number">2</span>
            <p>Delivery</p>
          </div>
          <div className="step-line"></div>
          <div className="step active">
            <span className="step-number">3</span>
            <p>Payment</p>
          </div>
          <div className="step-line"></div>
          <div className="step">
            <span className="step-number">4</span>
            <p>Confirmation</p>
          </div>
        </div>
      </header>

      <div className="payment-main">
        {/* Main Content */}
        <div className="payment-content">
          {/* Payment Method Section */}
          <section className="payment-section">
            <h3 className="section-title">Select Payment Method</h3>
            <div className="payment-methods">
              {/* Card Payment */}
              <div
                className={`payment-method-card ${selectedPayment === "card" ? "active" : ""}`}
                onClick={() => setSelectedPayment("card")}
              >
                <div className="method-header">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={selectedPayment === "card"}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                  />
                  <div className="method-info">
                    <h4>Card Payment</h4>
                    <p>Visa, MasterCard, Amex</p>
                  </div>
                </div>
              </div>

              {/* Cash on Delivery */}
              <div
                className={`payment-method-card ${selectedPayment === "cash" ? "active" : ""}`}
                onClick={() => setSelectedPayment("cash")}
              >
                <div className="method-header">
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={selectedPayment === "cash"}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                  />
                  <div className="method-info">
                    <h4>Cash on Delivery</h4>
                    <p>Pay when you receive your order</p>
                  </div>
                </div>
                <span className="icon">💵</span>
              </div>

              {/* Digital Wallet */}
              <div
                className={`payment-method-card ${selectedPayment === "wallet" ? "active" : ""}`}
                onClick={() => setSelectedPayment("wallet")}
              >
                <div className="method-header">
                  <input
                    type="radio"
                    name="payment"
                    value="wallet"
                    checked={selectedPayment === "wallet"}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                  />
                  <div className="method-info">
                    <h4>Digital Wallet</h4>
                    <p>Apple Pay, Google Pay</p>
                  </div>
                </div>
                <span className="icon">📱</span>
              </div>
            </div>
          </section>

          {/* Card Details Form - Show only if card selected */}
          {selectedPayment === "card" && (
            <section className="payment-section card-details-section">
              <h3 className="section-title">Card Details</h3>
              
              {/* Card Type Selection */}
              <div className="card-type-selection">
                <label className="card-type-label">Select Card Type</label>
                <div className="card-types">
                  <div
                    className={`card-type-option ${selectedCardType === "visa" ? "active" : ""}`}
                    onClick={() => setSelectedCardType("visa")}
                  >
                    <input
                      type="radio"
                      name="cardType"
                      value="visa"
                      checked={selectedCardType === "visa"}
                      onChange={(e) => setSelectedCardType(e.target.value)}
                    />
                    <span className="card-name">VISA</span>
                  </div>

                  <div
                    className={`card-type-option ${selectedCardType === "mastercard" ? "active" : ""}`}
                    onClick={() => setSelectedCardType("mastercard")}
                  >
                    <input
                      type="radio"
                      name="cardType"
                      value="mastercard"
                      checked={selectedCardType === "mastercard"}
                      onChange={(e) => setSelectedCardType(e.target.value)}
                    />
                    <span className="card-name">MasterCard</span>
                  </div>

                  <div
                    className={`card-type-option ${selectedCardType === "amex" ? "active" : ""}`}
                    onClick={() => setSelectedCardType("amex")}
                  >
                    <input
                      type="radio"
                      name="cardType"
                      value="amex"
                      checked={selectedCardType === "amex"}
                      onChange={(e) => setSelectedCardType(e.target.value)}
                    />
                    <span className="card-name">AMEX</span>
                  </div>
                </div>
              </div>

              <form className="card-form">
                <div className="form-group full">
                  <label>Cardholder Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    value={cardDetails.name}
                    onChange={handleCardChange}
                  />
                </div>

                <div className="form-group full">
                  <label>Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.cardNumber}
                    onChange={handleCardChange}
                    maxLength="19"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input
                      type="text"
                      name="expiry"
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={handleCardChange}
                      maxLength="5"
                    />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      placeholder="123"
                      value={cardDetails.cvv}
                      onChange={handleCardChange}
                      maxLength="3"
                    />
                  </div>
                </div>
              </form>
            </section>
          )}

          {/* Billing Details Section */}
          <section className="payment-section">
            <h3 className="section-title">Billing Details</h3>
            <form className="billing-form">
              <div className="form-group full">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Your full name"
                  value={billingDetails.fullName}
                  onChange={handleBillingChange}
                />
              </div>

              <div className="form-group full">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+1 (555) 123-4567"
                  value={billingDetails.phone}
                  onChange={handleBillingChange}
                />
              </div>

              <div className="form-group full">
                <label>Delivery Address</label>
                <textarea
                  name="address"
                  placeholder="Street address, city, postal code"
                  value={billingDetails.address}
                  onChange={handleBillingChange}
                  rows="3"
                ></textarea>
              </div>
            </form>
          </section>

          {/* Security Note */}
          <div className="security-note">
            <span className="lock-icon">🔒</span>
            <p>Your payment is secure and encrypted</p>
          </div>
        </div>

        {/* Order Summary Panel */}
        <aside className="order-summary-panel">
          <h3>Order Summary</h3>

          {/* Product Items */}
          <div className="order-items">
            <div className="order-item">
              <img src="/front_img/l1.jpeg" alt="Dark Chocolate" />
              <div className="item-details">
                <h4>Dark Chocolate</h4>
                <p className="quantity">Qty: 2</p>
              </div>
              <span className="item-price">$24.00</span>
            </div>

            <div className="order-item">
              <img src="/front_img/r1.jpeg" alt="Brownies" />
              <div className="item-details">
                <h4>Chocolate Brownies</h4>
                <p className="quantity">Qty: 1</p>
              </div>
              <span className="item-price">$12.99</span>
            </div>

            <div className="order-item">
              <img src="/front_img/second.jpg" alt="Truffles" />
              <div className="item-details">
                <h4>Cocoa Truffles</h4>
                <p className="quantity">Qty: 3</p>
              </div>
              <span className="item-price">$35.97</span>
            </div>
          </div>

          {/* Order Summary Details */}
          <div className="summary-divider"></div>

          <div className="summary-details">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>$72.96</span>
            </div>
            <div className="summary-row">
              <span>Delivery Fee</span>
              <span>$5.00</span>
            </div>
            <div className="summary-row discount">
              <span>Discount (10%)</span>
              <span>-$7.80</span>
            </div>
          </div>

          <div className="summary-divider"></div>

          <div className="summary-total">
            <span>Total</span>
            <span className="total-amount">$70.16</span>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="btn-primary">Pay Now</button>
            <button className="btn-secondary">← Back to Cart</button>
          </div>
        </aside>
      </div>
    </div>
  );
}
