import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { XCircle, ArrowRight, ShoppingBag } from 'lucide-react';
import './OrderSuccess.css';

export default function OrderCancelled() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="order-result-page">
      <div className="order-result-container">
        <div className="order-result-card order-result-failed">
          <XCircle size={64} className="order-result-icon order-result-icon-error" />
          <h1 className="order-result-title">Payment Cancelled</h1>
          <p className="order-result-subtitle">
            You cancelled the payment. Your order was not completed.
          </p>

          {orderId && (
            <div className="order-result-details">
              <div className="order-result-detail-row">
                <span>Order Reference</span>
                <span className="order-result-highlight">{orderId}</span>
              </div>
              <div className="order-result-detail-row">
                <span>Status</span>
                <span style={{ color: '#f87171' }}>Cancelled</span>
              </div>
            </div>
          )}

          <p className="order-result-note">
            Your cart items have been cleared, but you can add them again and retry your payment.
          </p>

          <div className="order-result-actions">
            <Link to="/events" className="order-result-btn-primary">
              <ShoppingBag size={16} />
              Back to Our Menu
            </Link>
            <Link to="/" className="order-result-btn-secondary">
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
