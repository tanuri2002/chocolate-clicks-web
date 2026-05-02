import React, { useState, useEffect } from "react";
import "./ShoppingCart.css";

export default function ShoppingCart({ onProceedToCheckout, onContinueShopping }) {
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem("cakes_cart");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem("cakes_cart", JSON.stringify(cart));
  }, [cart]);

  function changeQty(id, delta) {
    setCart((prev) => {
      const copy = { ...prev };
      if (!copy[id]) return prev;
      copy[id].qty += delta;
      if (copy[id].qty <= 0) delete copy[id];
      return copy;
    });
  }

  function removeItem(id) {
    setCart((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  }

  const cartItems = Object.values(cart);
  const subtotal = cartItems.reduce((s, it) => s + it.price * it.qty, 0);
  const deliveryFee = cartItems.length > 0 ? 500 : 0;
  const discount = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee - discount;

  return (
    <div className="sc-page">
      {/* Header */}
      <header className="sc-header">
        <div className="sc-header-inner">
          <div className="sc-logo">
            <img src="/front_img/logo.jpeg" alt="Chocolate Clicks" />
            <span>Chocolate Clicks</span>
          </div>
          <div className="sc-steps">
            {["Cart", "Delivery", "Payment", "Confirmation"].map((s, i) => (
              <React.Fragment key={s}>
                <div className={`sc-step ${i === 0 ? "active" : ""}`}>
                  <div className="sc-step-num">{i + 1}</div>
                  <div className="sc-step-label">{s}</div>
                </div>
                {i < 3 && <div className="sc-step-line" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </header>

      <main className="sc-main">
        {/* Left: Cart Items */}
        <section className="sc-items-section">
          <div className="sc-section-header">
            <h2>Shopping Cart</h2>
            <span className="sc-item-count">{cartItems.length} item{cartItems.length !== 1 ? "s" : ""}</span>
          </div>

          {cartItems.length === 0 ? (
            <div className="sc-empty">
              <div className="sc-empty-icon">🛒</div>
              <p>Your cart is empty</p>
              <button className="sc-continue-btn" onClick={onContinueShopping}>
                Browse Our Cakes
              </button>
            </div>
          ) : (
            <div className="sc-item-list">
              {cartItems.map((item, idx) => (
                <div
                  className="sc-item"
                  key={item.id}
                  style={{ animationDelay: `${idx * 0.07}s` }}
                >
                  <div className="sc-item-img">
                    <img src={item.img} alt={item.name} />
                  </div>
                  <div className="sc-item-body">
                    <div className="sc-item-top">
                      <div>
                        <h3 className="sc-item-name">{item.name}</h3>
                        <p className="sc-item-desc">{item.desc}</p>
                        <span className="sc-in-stock">✓ In Stock</span>
                      </div>
                      <button
                        className="sc-remove"
                        onClick={() => removeItem(item.id)}
                        title="Remove item"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="sc-item-bottom">
                      <div className="sc-qty">
                        <button onClick={() => changeQty(item.id, -1)}>−</button>
                        <span>{item.qty}</span>
                        <button onClick={() => changeQty(item.id, +1)}>+</button>
                      </div>
                      <div className="sc-item-price">
                        <span className="sc-unit">LKR {item.price.toLocaleString()} each</span>
                        <span className="sc-total-item">LKR {(item.price * item.qty).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="sc-continue-link">
                <button onClick={onContinueShopping}>← Continue Shopping</button>
              </div>
            </div>
          )}
        </section>

        {/* Right: Summary */}
        {cartItems.length > 0 && (
          <aside className="sc-summary">
            <div className="sc-summary-inner">
              <h3>Order Summary</h3>

              <div className="sc-summary-rows">
                <div className="sc-summary-row">
                  <span>Subtotal ({cartItems.reduce((a, i) => a + i.qty, 0)} items)</span>
                  <span>LKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="sc-summary-row">
                  <span>Delivery Fee</span>
                  <span>LKR {deliveryFee.toLocaleString()}</span>
                </div>
                <div className="sc-summary-row sc-discount">
                  <span>5% Member Discount</span>
                  <span>− LKR {discount.toLocaleString()}</span>
                </div>
              </div>

              <div className="sc-summary-divider" />

              <div className="sc-summary-total">
                <span>Total</span>
                <span className="sc-total-amount">LKR {total.toLocaleString()}</span>
              </div>

              <button
                className="sc-checkout-btn"
                onClick={onProceedToCheckout}
              >
                Proceed to Checkout
              </button>

              <div className="sc-security">
                <span>🔒</span>
                <p>Secure & encrypted checkout</p>
              </div>

              <div className="sc-accepted">
                <span className="sc-accepted-label">We accept</span>
                <div className="sc-cards">
                  <span className="sc-card-badge">VISA</span>
                  <span className="sc-card-badge">MC</span>
                  <span className="sc-card-badge">AMEX</span>
                  <span className="sc-card-badge">COD</span>
                </div>
              </div>
            </div>
          </aside>
        )}
      </main>
    </div>
  );
}