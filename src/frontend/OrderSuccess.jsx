import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Clock, XCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { getOrderById } from '../api';
import './OrderSuccess.css';

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) {
      setError('No order ID found.');
      setLoading(false);
      return;
    }

    let attempts = 0;
    const MAX_POLLS = 6; // Poll up to 6x (12 seconds) waiting for IPN
    let timer;

    async function fetchOrder() {
      try {
        const res = await getOrderById(orderId);
        if (res.success && res.order) {
          setOrder(res.order);
          // If still pending, poll a few more times (PayHere IPN can be delayed)
          if (res.order.paymentStatus === 'pending' && attempts < MAX_POLLS) {
            attempts++;
            timer = setTimeout(fetchOrder, 2000);
          } else {
            setLoading(false);
          }
        } else {
          throw new Error(res.message || 'Order not found');
        }
      } catch (err) {
        setError(err.message || 'Failed to load order details');
        setLoading(false);
      }
    }

    fetchOrder();
    return () => clearTimeout(timer);
  }, [orderId]);

  return (
    <div className="order-result-page">
      <div className="order-result-container">
        {loading && (
          <div className="order-result-card order-result-pending">
            <div className="order-result-spinner" aria-hidden="true" />
            <h1 className="order-result-title">Verifying Payment…</h1>
            <p className="order-result-subtitle">
              Please wait while we confirm your payment with PayHere.
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="order-result-card order-result-error">
            <XCircle size={60} className="order-result-icon order-result-icon-error" />
            <h1 className="order-result-title">Something Went Wrong</h1>
            <p className="order-result-subtitle">{error}</p>
            <Link to="/events" className="order-result-btn-primary">
              Back to Our Menu <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {!loading && !error && order && (
          <>
            {order.paymentStatus === 'paid' && (
              <div className="order-result-card order-result-success">
                <CheckCircle2 size={64} className="order-result-icon order-result-icon-success" />
                <h1 className="order-result-title">Order Confirmed!</h1>
                <p className="order-result-subtitle">
                  Thank you, <strong>{order.customer?.firstName}</strong>! Your order has been placed
                  and payment received.
                </p>

                <div className="order-result-details">
                  <div className="order-result-detail-row">
                    <span>Order Number</span>
                    <span className="order-result-highlight">{order.orderNumber}</span>
                  </div>
                  <div className="order-result-detail-row">
                    <span>Total Paid</span>
                    <span className="order-result-highlight">
                      {order.currency} {Number(order.total).toLocaleString()}
                    </span>
                  </div>
                  <div className="order-result-detail-row">
                    <span>Fulfillment</span>
                    <span>{order.orderType === 'pickup' ? 'Store Pickup' : 'Delivery'}</span>
                  </div>
                  {order.orderType === 'delivery' && (
                    <div className="order-result-detail-row">
                      <span>Deliver to</span>
                      <span>{order.address}, {order.city}</span>
                    </div>
                  )}
                </div>

                <div className="order-result-items">
                  <h3>Items Ordered</h3>
                  {order.items.map((item, i) => (
                    <div key={i} className="order-result-item-row">
                      <span className="order-result-item-name">
                        {item.name} <span className="order-result-item-qty">x{item.quantity}</span>
                      </span>
                      <span className="order-result-item-price">
                        LKR {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="order-result-actions">
                  <Link to="/" className="order-result-btn-primary">
                    Back to Home <ArrowRight size={16} />
                  </Link>
                  <Link to="/events" className="order-result-btn-secondary">
                    Order Again
                  </Link>
                </div>
              </div>
            )}

            {order.paymentStatus === 'pending' && (
              <div className="order-result-card order-result-pending-final">
                <Clock size={60} className="order-result-icon order-result-icon-pending" />
                <h1 className="order-result-title">Payment Pending</h1>
                <p className="order-result-subtitle">
                  Your order <strong>{order.orderNumber}</strong> has been placed but payment
                  confirmation is still being processed. We'll update you once it's confirmed.
                </p>
                <Link to="/" className="order-result-btn-primary">
                  Back to Home <ArrowRight size={16} />
                </Link>
              </div>
            )}

            {(order.paymentStatus === 'failed' ||
              order.paymentStatus === 'cancelled' ||
              order.paymentStatus === 'chargedback') && (
              <div className="order-result-card order-result-failed">
                <XCircle size={60} className="order-result-icon order-result-icon-error" />
                <h1 className="order-result-title">
                  {order.paymentStatus === 'failed' ? 'Payment Failed' : order.paymentStatus === 'cancelled' ? 'Payment Cancelled' : 'Payment Charged Back'}
                </h1>
                <p className="order-result-subtitle">
                  {order.paymentStatus === 'cancelled'
                    ? 'You cancelled the payment. Your order was not placed.'
                    : 'There was an issue with your payment. Please try again.'}
                </p>
                <div className="order-result-actions">
                  <Link to="/checkout" className="order-result-btn-primary">
                    Try Again <ArrowRight size={16} />
                  </Link>
                  <Link to="/events" className="order-result-btn-secondary">
                    Continue Shopping
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
