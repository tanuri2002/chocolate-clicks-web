import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ShoppingBag, Truck, Store, AlertCircle } from 'lucide-react';
import { useCart } from './context/CartContext';
import { getStoredUser, createOrder } from '../api';
import './Checkout.css';

export default function Checkout() {
  const { items, totalItems, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  // Redirect if cart is empty
  useEffect(() => {
    if (totalItems === 0) {
      navigate('/events', { replace: true });
    }
  }, [totalItems, navigate]);

  // Form state initialized with stored user details if available
  const [form, setForm] = useState(() => {
    const user = getStoredUser();
    let firstName = '';
    let lastName = '';
    if (user?.fullName) {
      const parts = user.fullName.trim().split(/\s+/);
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || '';
    }
    return {
      firstName: firstName || '',
      lastName: lastName || '',
      email: user?.email || '',
      phone: user?.phoneNo || user?.phone || '',
      orderType: 'Delivery', // 'Delivery' | 'Pickup'
      address: user?.address || '',
      city: '',
      notes: '',
    };
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  if (totalItems === 0) {
    return null;
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  function validate() {
    const errs = {};

    if (!form.firstName.trim()) {
      errs.firstName = 'First name is required';
    }

    if (!form.lastName.trim()) {
      errs.lastName = 'Last name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!emailRegex.test(form.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    // Sri Lankan phone validation (07XXXXXXXX or +947XXXXXXXX)
    const cleanPhone = form.phone.replace(/[\s-]/g, '');
    const slPhoneRegex = /^(?:\+94|0)7[0-9]{8}$/;
    if (!form.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!slPhoneRegex.test(cleanPhone)) {
      errs.phone = 'Please enter a valid Sri Lankan phone number (e.g. 07XXXXXXXX or +947XXXXXXXX)';
    }

    // Delivery-only fields
    if (form.orderType === 'Delivery') {
      if (!form.address.trim()) {
        errs.address = 'Street address is required for delivery';
      }
      if (!form.city.trim()) {
        errs.city = 'City is required for delivery';
      }
    }

    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError(null);
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstErrorField = document.querySelector('.checkout-input-error');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const payload = {
      items: items.map((item) => ({
        menuItemId: item.id,
        quantity: item.quantity,
      })),
      customer: {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      },
      orderType: form.orderType,
      address: form.orderType === 'Delivery' ? form.address.trim() : '',
      city: form.orderType === 'Delivery' ? form.city.trim() : '',
      notes: form.notes.trim(),
    };

    setSubmitting(true);
    try {
      const res = await createOrder(payload);

      if (res.success && res.actionUrl && res.params) {
        // Clear the cart on successful order placement
        clearCart();

        // Create and auto-submit a hidden form to PayHere checkout
        const formEl = document.createElement('form');
        formEl.setAttribute('method', 'POST');
        formEl.setAttribute('action', res.actionUrl);
        formEl.style.display = 'none';

        Object.entries(res.params).forEach(([key, val]) => {
          const input = document.createElement('input');
          input.setAttribute('type', 'hidden');
          input.setAttribute('name', key);
          input.setAttribute('value', val != null ? String(val) : '');
          formEl.appendChild(input);
        });

        document.body.appendChild(formEl);
        formEl.submit();
      } else {
        throw new Error(res.message || 'Failed to initialize PayHere checkout.');
      }
    } catch (err) {
      console.error('Order creation failed:', err);
      setApiError(err.message || 'Failed to place order. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {/* Navigation Breadcrumb / Back button */}
        <div className="checkout-top-bar">
          <Link to="/events" className="checkout-back-link">
            <ArrowLeft size={16} /> Continue shopping
          </Link>
        </div>

        <h1 className="checkout-heading">Checkout</h1>

        {/* API Error Banner */}
        {apiError && (
          <div className="checkout-error-banner" role="alert">
            <AlertCircle size={22} className="checkout-error-banner-icon" />
            <div>
              <h3>Order Creation Failed</h3>
              <p>{apiError}</p>
            </div>
          </div>
        )}

        <div className="checkout-layout">
          {/* Left Column: Form */}
          <div className="checkout-form-column">
            <form onSubmit={handleSubmit} noValidate>
              {/* Order Type Selection */}
              <div className="checkout-card">
                <h2 className="checkout-section-title">1. Fulfillment Method</h2>
                <div className="checkout-order-type-options">
                  <label
                    className={`checkout-order-type-card ${
                      form.orderType === 'Delivery' ? 'selected' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="orderType"
                      value="Delivery"
                      checked={form.orderType === 'Delivery'}
                      onChange={handleInputChange}
                    />
                    <Truck size={20} className="checkout-type-icon" />
                    <div>
                      <div className="checkout-type-name">Delivery</div>
                      <div className="checkout-type-desc">Direct to your doorstep</div>
                    </div>
                  </label>

                  <label
                    className={`checkout-order-type-card ${
                      form.orderType === 'Pickup' ? 'selected' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="orderType"
                      value="Pickup"
                      checked={form.orderType === 'Pickup'}
                      onChange={handleInputChange}
                    />
                    <Store size={20} className="checkout-type-icon" />
                    <div>
                      <div className="checkout-type-name">Store Pickup</div>
                      <div className="checkout-type-desc">Collect at our kitchen</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Customer Contact */}
              <div className="checkout-card">
                <h2 className="checkout-section-title">2. Customer Details</h2>

                <div className="checkout-form-grid-2">
                  <div className="checkout-form-group">
                    <label htmlFor="firstName">
                      First Name <span className="required-star">*</span>
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={form.firstName}
                      onChange={handleInputChange}
                      placeholder="e.g. John"
                      className={errors.firstName ? 'checkout-input-error' : ''}
                    />
                    {errors.firstName && (
                      <span className="checkout-error-text">
                        <AlertCircle size={13} /> {errors.firstName}
                      </span>
                    )}
                  </div>

                  <div className="checkout-form-group">
                    <label htmlFor="lastName">
                      Last Name <span className="required-star">*</span>
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={form.lastName}
                      onChange={handleInputChange}
                      placeholder="e.g. Silva"
                      className={errors.lastName ? 'checkout-input-error' : ''}
                    />
                    {errors.lastName && (
                      <span className="checkout-error-text">
                        <AlertCircle size={13} /> {errors.lastName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="checkout-form-grid-2">
                  <div className="checkout-form-group">
                    <label htmlFor="email">
                      Email Address <span className="required-star">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      className={errors.email ? 'checkout-input-error' : ''}
                    />
                    {errors.email && (
                      <span className="checkout-error-text">
                        <AlertCircle size={13} /> {errors.email}
                      </span>
                    )}
                  </div>

                  <div className="checkout-form-group">
                    <label htmlFor="phone">
                      Phone Number <span className="required-star">*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleInputChange}
                      placeholder="07XXXXXXXX or +947XXXXXXXX"
                      className={errors.phone ? 'checkout-input-error' : ''}
                    />
                    {errors.phone && (
                      <span className="checkout-error-text">
                        <AlertCircle size={13} /> {errors.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Address (only when Delivery selected) */}
              {form.orderType === 'Delivery' && (
                <div className="checkout-card">
                  <h2 className="checkout-section-title">3. Delivery Address</h2>

                  <div className="checkout-form-group">
                    <label htmlFor="address">
                      Street Address <span className="required-star">*</span>
                    </label>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      value={form.address}
                      onChange={handleInputChange}
                      placeholder="House / Building No, Street Name"
                      className={errors.address ? 'checkout-input-error' : ''}
                    />
                    {errors.address && (
                      <span className="checkout-error-text">
                        <AlertCircle size={13} /> {errors.address}
                      </span>
                    )}
                  </div>

                  <div className="checkout-form-group">
                    <label htmlFor="city">
                      City <span className="required-star">*</span>
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={form.city}
                      onChange={handleInputChange}
                      placeholder="e.g. Colombo, Kandy, Galle"
                      className={errors.city ? 'checkout-input-error' : ''}
                    />
                    {errors.city && (
                      <span className="checkout-error-text">
                        <AlertCircle size={13} /> {errors.city}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Order Notes */}
              <div className="checkout-card">
                <h2 className="checkout-section-title">
                  {form.orderType === 'Delivery' ? '4.' : '3.'} Order Notes (Optional)
                </h2>
                <div className="checkout-form-group">
                  <label htmlFor="notes">Special requests or instructions</label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={form.notes}
                    onChange={handleInputChange}
                    placeholder="e.g. Gate code, eggless request, birthday message on card..."
                  />
                </div>
              </div>

              {/* Submit Button for Mobile / End of Form */}
              <div className="checkout-submit-wrap">
                <button
                  type="submit"
                  className="checkout-place-order-btn"
                  disabled={submitting}
                >
                  {submitting
                    ? 'Connecting to PayHere...'
                    : `Pay with PayHere • LKR ${subtotal.toLocaleString()}`}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Order Summary */}
          <div className="checkout-summary-column">
            <div className="checkout-card checkout-summary-card">
              <div className="checkout-summary-header">
                <ShoppingBag size={20} className="checkout-summary-icon" />
                <h2 className="checkout-summary-title">
                  Order Summary <span className="checkout-summary-count">({totalItems})</span>
                </h2>
              </div>

              <div className="checkout-summary-items">
                {items.map((item) => {
                  const lineTotal = item.price * item.quantity;
                  return (
                    <div key={item.id} className="checkout-summary-item">
                      <div className="checkout-summary-img-wrap">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} />
                        ) : (
                          <div className="checkout-summary-img-placeholder" aria-hidden="true" />
                        )}
                        <span className="checkout-summary-qty-badge">{item.quantity}</span>
                      </div>

                      <div className="checkout-summary-item-info">
                        <div className="checkout-summary-item-name">{item.name}</div>
                        <div className="checkout-summary-item-unit">
                          LKR {item.price.toLocaleString()} each
                        </div>
                      </div>

                      <div className="checkout-summary-item-total">
                        LKR {lineTotal.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="checkout-summary-calc">
                <div className="checkout-calc-row">
                  <span>Subtotal</span>
                  <span>LKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="checkout-calc-row">
                  <span>Fulfillment</span>
                  <span>{form.orderType}</span>
                </div>
                <div className="checkout-calc-row checkout-total-row">
                  <span>Total</span>
                  <span className="checkout-total-value">LKR {subtotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="checkout-summary-guarantee">
                🔒 Secure order processing. Payment step will be connected in Step 4.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
