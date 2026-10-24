// src/frontend/DashboardOverview.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, Users, XCircle, DollarSign, AlertCircle } from 'lucide-react';
import { getAdminOrderSummary } from '../api';
import AnalyticsSection from './analytics/AnalyticsSection';
import './Dashboard.css';

/**
 * Format currency amount into Sri Lankan Rupee (LKR) standard format
 */
export function formatLKR(amount) {
  const num = Number(amount) || 0;
  return `LKR ${num.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format dates into clean, human-readable strings
 */
function formatOrderDate(dateString) {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Overview component (/dashboard):
 * Displays aggregated Order & Customer metrics from MongoDB,
 * along with the 5 most recent orders with a quick link to the Orders page.
 */
export default function DashboardOverview() {
  const [data, setData] = useState({
    orderSummary: {
      totalOrders: 0,
      completedOrders: 0,
      pendingOrders: 0,
      cancelledOrders: 0,
      totalRevenue: 0,
    },
    customerSummary: {
      totalCustomers: 0,
      activeCustomers: 0,
      inactiveCustomers: 0,
      avgOrderValue: 0,
      customerRevenue: 0,
    },
    recentOrders: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch aggregated statistics from the backend
  useEffect(() => {
    let isMounted = true;

    async function fetchSummary() {
      setLoading(true);
      setError(null);
      try {
        const response = await getAdminOrderSummary();
        if (isMounted) {
          setData({
            orderSummary: response.orderSummary || {},
            customerSummary: response.customerSummary || {},
            recentOrders: response.recentOrders || [],
          });
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load dashboard overview data:', err);
          setError(err.message || 'Failed to load summary statistics.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchSummary();
    return () => {
      isMounted = false;
    };
  }, []);

  const { orderSummary, customerSummary, recentOrders } = data;

  return (
    <div className="overview-container">
      {/* Error alert if backend call failed */}
      {error && (
        <div className="admin-alert admin-alert-error" role="alert">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state indicator */}
      {loading ? (
        <div className="admin-loading-state">
          <div className="admin-spinner" />
          <p>Loading dashboard statistics...</p>
        </div>
      ) : (
        <>
          {/* Order Summary Cards */}
          <section className="summary-section" aria-labelledby="order-summary-title">
            <h2 id="order-summary-title" className="section-title">Order Summary</h2>
            <div className="order-summary-cards">
              {/* Total Orders */}
              <div className="summary-card">
                <div className="summary-icon" style={{ backgroundColor: '#1e40af' }}>
                  <Package size={24} color="white" />
                </div>
                <div className="summary-content">
                  <div className="summary-label">Total Orders</div>
                  <div className="summary-value">{orderSummary.totalOrders ?? 0}</div>
                  <div className="summary-subtitle">All orders placed</div>
                </div>
              </div>

              {/* Completed Orders */}
              <div className="summary-card">
                <div className="summary-icon" style={{ backgroundColor: '#16a34a' }}>
                  <CheckCircle size={24} color="white" />
                </div>
                <div className="summary-content">
                  <div className="summary-label">Completed Orders</div>
                  <div className="summary-value">{orderSummary.completedOrders ?? 0}</div>
                  <div className="summary-subtitle">Delivered or picked up</div>
                </div>
              </div>

              {/* Pending / Active Orders */}
              <div className="summary-card">
                <div className="summary-icon" style={{ backgroundColor: '#ea580c' }}>
                  <Clock size={24} color="white" />
                </div>
                <div className="summary-content">
                  <div className="summary-label">Pending Orders</div>
                  <div className="summary-value">{orderSummary.pendingOrders ?? 0}</div>
                  <div className="summary-subtitle">Pending, processing & shipped</div>
                </div>
              </div>

              {/* Cancelled Orders */}
              <div className="summary-card">
                <div className="summary-icon" style={{ backgroundColor: '#dc2626' }}>
                  <XCircle size={24} color="white" />
                </div>
                <div className="summary-content">
                  <div className="summary-label">Cancelled Orders</div>
                  <div className="summary-value">{orderSummary.cancelledOrders ?? 0}</div>
                  <div className="summary-subtitle">Not completed</div>
                </div>
              </div>

              {/* Total Revenue */}
              <div className="summary-card">
                <div className="summary-icon" style={{ backgroundColor: '#7c3aed' }}>
                  <DollarSign size={24} color="white" />
                </div>
                <div className="summary-content">
                  <div className="summary-label">Total Revenue</div>
                  <div className="summary-value">{formatLKR(orderSummary.totalRevenue)}</div>
                  <div className="summary-subtitle">From all non-cancelled orders</div>
                </div>
              </div>
            </div>
          </section>

          {/* Customer Summary Cards */}
          <section className="summary-section" aria-labelledby="customer-summary-title">
            <h2 id="customer-summary-title" className="section-title">Customer Summary</h2>
            <div className="order-summary-cards">
              {/* Total Customers */}
              <div className="summary-card">
                <div className="summary-icon" style={{ backgroundColor: '#2563eb' }}>
                  <Users size={24} color="white" />
                </div>
                <div className="summary-content">
                  <div className="summary-label">Total Customers</div>
                  <div className="summary-value">{customerSummary.totalCustomers ?? 0}</div>
                  <div className="summary-subtitle">Registered customers</div>
                </div>
              </div>

              {/* Active Customers */}
              <div className="summary-card">
                <div className="summary-icon" style={{ backgroundColor: '#10b981' }}>
                  <Users size={24} color="white" />
                </div>
                <div className="summary-content">
                  <div className="summary-label">Active Customers</div>
                  <div className="summary-value">{customerSummary.activeCustomers ?? 0}</div>
                  <div className="summary-subtitle">Have placed orders</div>
                </div>
              </div>

              {/* Inactive Customers */}
              <div className="summary-card">
                <div className="summary-icon" style={{ backgroundColor: '#6b7280' }}>
                  <Users size={24} color="white" />
                </div>
                <div className="summary-content">
                  <div className="summary-label">Inactive Customers</div>
                  <div className="summary-value">{customerSummary.inactiveCustomers ?? 0}</div>
                  <div className="summary-subtitle">Registered with no orders</div>
                </div>
              </div>

              {/* Avg Order Value */}
              <div className="summary-card">
                <div className="summary-icon" style={{ backgroundColor: '#f59e0b' }}>
                  <DollarSign size={24} color="white" />
                </div>
                <div className="summary-content">
                  <div className="summary-label">Avg Order Value</div>
                  <div className="summary-value">{formatLKR(customerSummary.avgOrderValue)}</div>
                  <div className="summary-subtitle">Per order amount</div>
                </div>
              </div>

              {/* Customer Revenue */}
              <div className="summary-card">
                <div className="summary-icon" style={{ backgroundColor: '#8b5cf6' }}>
                  <DollarSign size={24} color="white" />
                </div>
                <div className="summary-content">
                  <div className="summary-label">Customer Revenue</div>
                  <div className="summary-value">{formatLKR(customerSummary.customerRevenue)}</div>
                  <div className="summary-subtitle">Total customer spend</div>
                </div>
              </div>
            </div>
          </section>

          {/* Analytics Section */}
          <AnalyticsSection />

          {/* Recent Orders Card (Latest 5 orders) */}
          <section className="recent-orders-card" aria-labelledby="recent-orders-title">
            <div className="recent-orders-header">
              <h2 id="recent-orders-title">
                <Package size={18} className="icon-orange" /> Recent Orders
              </h2>
              <Link to="/dashboard/orders" className="view-all-btn">
                View All
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p className="admin-empty-text">No recent orders found.</p>
            ) : (
              <div className="orders-list">
                {recentOrders.map((order) => {
                  const customerName = order.customer
                    ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() || 'Guest Customer'
                    : 'Customer';

                  const itemsCount = Array.isArray(order.items)
                    ? order.items.reduce((sum, item) => sum + (item.quantity || 1), 0)
                    : 0;

                  const itemsSummary = Array.isArray(order.items)
                    ? order.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')
                    : 'Items';

                  const orderStatus = order.status || 'Pending';

                  return (
                    <div key={order._id || order.orderNumber} className="order-item">
                      <div>
                        <div className="order-title">
                          <Link to="/dashboard/orders" className="order-id-link">
                            {order.orderNumber || order._id}
                          </Link>
                        </div>
                        <div className="order-product">{customerName}</div>
                        <div className="order-details">
                          <span title={itemsSummary}>
                            {itemsCount} item{itemsCount !== 1 ? 's' : ''}: {itemsSummary.slice(0, 50)}
                            {itemsSummary.length > 50 ? '...' : ''}
                          </span>
                          <span className="order-time">{formatOrderDate(order.createdAt)}</span>
                        </div>
                      </div>
                      <div className="order-right">
                        <div className="order-amount">{formatLKR(order.total)}</div>
                        <span className={`order-status ${orderStatus.toLowerCase()}`}>
                          {orderStatus}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
