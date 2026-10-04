import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from './context/CartContext';
import './CartDrawer.css';

export default function CartDrawer() {
  const {
    items,
    totalItems,
    subtotal,
    removeItem,
    updateQuantity,
    isCartOpen,
    closeCart,
  } = useCart();
  const navigate = useNavigate();

  // Close on Escape key & Lock body scroll
  useEffect(() => {
    if (!isCartOpen) return;

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        closeCart();
      }
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  function handleCheckout() {
    closeCart();
    navigate('/checkout');
  }

  function handleExploreMenu() {
    closeCart();
    navigate('/events');
  }

  return (
    <div className="cart-drawer-overlay" onClick={closeCart} aria-modal="true" role="dialog">
      <div
        className="cart-drawer"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="cart-drawer-header">
          <div className="cart-drawer-title-wrap">
            <ShoppingBag size={20} className="cart-drawer-title-icon" />
            <h2 className="cart-drawer-title">
              Your Cart <span className="cart-drawer-count">({totalItems})</span>
            </h2>
          </div>
          <button
            type="button"
            className="cart-drawer-close-btn"
            onClick={closeCart}
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="cart-drawer-empty">
            <div className="cart-drawer-empty-icon" aria-hidden="true">🍫</div>
            <h3>Your cart is empty</h3>
            <p>Indulge in our freshly baked artisanal cakes, fudgy brownies, and treats.</p>
            <button
              type="button"
              className="cart-drawer-explore-btn"
              onClick={handleExploreMenu}
            >
              Explore Our Menu
            </button>
          </div>
        ) : (
          <div className="cart-drawer-items">
            {items.map((item) => {
              const lineTotal = item.price * item.quantity;
              return (
                <div key={item.id} className="cart-drawer-item">
                  <div className="cart-drawer-item-img-wrap">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} />
                    ) : (
                      <div className="cart-drawer-img-placeholder" aria-hidden="true" />
                    )}
                  </div>

                  <div className="cart-drawer-item-details">
                    <div className="cart-drawer-item-top">
                      <h4 className="cart-drawer-item-name">{item.name}</h4>
                      <button
                        type="button"
                        className="cart-drawer-remove-btn"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="cart-drawer-item-unit-price">
                      LKR {item.price.toLocaleString()} each
                    </div>

                    <div className="cart-drawer-item-bottom">
                      <div className="cart-drawer-qty-control">
                        <button
                          type="button"
                          className="cart-drawer-qty-btn"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="cart-drawer-qty-value">{item.quantity}</span>
                        <button
                          type="button"
                          className="cart-drawer-qty-btn"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className="cart-drawer-item-line-total">
                        LKR {lineTotal.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        {items.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-drawer-subtotal-row">
              <span className="cart-drawer-subtotal-label">Subtotal</span>
              <span className="cart-drawer-subtotal-value">
                LKR {subtotal.toLocaleString()}
              </span>
            </div>

            <p className="cart-drawer-note">Taxes and delivery calculated at checkout.</p>

            <button
              type="button"
              className="cart-drawer-checkout-btn"
              onClick={handleCheckout}
              disabled={items.length === 0}
            >
              Proceed to Checkout
            </button>

            <button
              type="button"
              className="cart-drawer-continue-btn"
              onClick={closeCart}
            >
              Continue shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
