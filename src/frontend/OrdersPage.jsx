// src/frontend/OrdersPage.jsx
import React, { useEffect, useState, useTransition } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
  CreditCard,
} from 'lucide-react';
import { getAdminOrders, updateOrderStatus } from '../api';
import { formatLKR } from './DashboardOverview';
import './Dashboard.css';

// Allowed next fulfillment statuses for each state
// Forward transitions and cancellations are allowed; terminal states (Completed, Cancelled) cannot be reverted
const VALID_TRANSITIONS = {
  Pending: ['Processing', 'Shipped', 'Completed', 'Cancelled'],
  Processing: ['Shipped', 'Completed', 'Cancelled'],
  Shipped: ['Completed', 'Cancelled'],
  Completed: [],
  Cancelled: [],
  // Legacy status safety for existing orders in DB
  'Awaiting Approval': ['Processing', 'Completed', 'Cancelled'],
  Approved: ['Processing', 'Completed', 'Cancelled'],
  Declined: ['Cancelled'],
};

const ALL_STATUSES = ['Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled'];

/**
 * Format order creation date into human-readable format
 */
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format payment status into badge styles and labels
 */
function PaymentBadge({ status }) {
  const norm = (status || 'pending').toLowerCase();
  let badgeClass = 'payment-pending';
  if (norm === 'paid') badgeClass = 'payment-paid';
  else if (norm === 'failed' || norm === 'cancelled' || norm === 'chargedback') {
    badgeClass = 'payment-failed';
  }

  return (
    <span className={`payment-status-badge ${badgeClass}`}>
      <CreditCard size={12} className="inline-icon" />
      {status ? status.toUpperCase() : 'PENDING'}
    </span>
  );
}

/**
 * Orders management page (/dashboard/orders)
 * Includes server-side pagination, searching, status filtering,
 * and state transition validation.
 */
export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  const [statusFilter, setStatusFilter] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [, startTransition] = useTransition();

  // Debounce search query changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 350);

    return () => clearTimeout(handler);
  }, [searchInput]);

  // Fetch orders from server whenever page, status, or search query changes
  async function loadOrders(page = pagination.page) {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await getAdminOrders({
        page,
        limit: 10,
        status: statusFilter,
        search: searchQuery,
      });

      setOrders(data.orders || []);
      setPagination(
        data.pagination || {
          page: 1,
          limit: 10,
          total: (data.orders || []).length,
          pages: 1,
        }
      );
    } catch (err) {
      console.error('Failed to load orders:', err);
      setErrorMessage(err.message || 'Could not load orders.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders(pagination.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, statusFilter, searchQuery]);

  // Handle changing status via dropdown
  async function handleStatusChange(orderId, currentStatus, newStatus) {
    if (currentStatus === newStatus) return;

    const allowed = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      setErrorMessage(
        `Invalid status change: Orders in "${currentStatus}" status cannot be changed to "${newStatus}".`
      );
      return;
    }

    setUpdatingId(orderId);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await updateOrderStatus(orderId, newStatus);
      startTransition(() => {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: response.order?.status || newStatus } : o))
        );
      });
      setSuccessMessage(`Order #${orderId.slice(-6)} status updated to ${newStatus}.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Status update failed:', err);
      setErrorMessage(err.message || 'Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  }

  function handleFilterSelect(status) {
    setStatusFilter(status);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }

  function handleClearSearch() {
    setSearchInput('');
    setSearchQuery('');
    setPagination((prev) => ({ ...prev, page: 1 }));
  }

  function handleResetFilters() {
    setStatusFilter('all');
    setSearchInput('');
    setSearchQuery('');
    setPagination((prev) => ({ ...prev, page: 1 }));
  }

  const startRecord = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const endRecord = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="orders-page-container">
      {/* Title & Actions Bar */}
      <div className="orders-page-header">
        <div className="orders-header-title">
          <h2>
            <ShoppingBag size={22} className="icon-orange" /> Orders Management
          </h2>
          <span className="orders-total-badge">
            {pagination.total} Total Order{pagination.total !== 1 ? 's' : ''}
          </span>
        </div>

        <button
          className="admin-btn-secondary"
          onClick={() => loadOrders(pagination.page)}
          disabled={loading}
          title="Refresh orders list"
        >
          <RefreshCw size={15} className={loading ? 'admin-spin-icon' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="admin-alert admin-alert-error" role="alert">
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
          <button className="admin-alert-close" onClick={() => setErrorMessage('')} aria-label="Close">
            <X size={15} />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="admin-alert admin-alert-success" role="alert">
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
          <button className="admin-alert-close" onClick={() => setSuccessMessage('')} aria-label="Close">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="orders-controls-bar">
        {/* Search Input */}
        <div className="orders-search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by order ID or customer name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="orders-search-input"
          />
          {searchInput && (
            <button
              type="button"
              className="orders-search-clear"
              onClick={handleClearSearch}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Status Filter Chips */}
        <div className="orders-status-filters" role="group" aria-label="Filter orders by status">
          <button
            type="button"
            className={`status-filter-chip ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterSelect('all')}
          >
            All
          </button>
          {ALL_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              className={`status-filter-chip ${statusFilter.toLowerCase() === status.toLowerCase() ? 'active' : ''}`}
              onClick={() => handleFilterSelect(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="customers-card orders-table-card">
        {loading && orders.length === 0 ? (
          <div className="admin-loading-state">
            <div className="admin-spinner" />
            <p>Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="admin-empty-state">
            <ShoppingBag size={40} className="empty-icon" />
            <h3>No orders found</h3>
            <p>
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search query or status filter.'
                : 'There are currently no orders in the database.'}
            </p>
            {(searchQuery || statusFilter !== 'all') && (
              <button className="view-all-btn" onClick={handleResetFilters}>
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="customers-table-wrapper">
              <table className="customers-table orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment Status</th>
                    <th>Date</th>
                    <th>Order Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const currentStatus = order.status || 'Pending';
                    const customerName = order.customer
                      ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() || 'Guest'
                      : 'N/A';
                    const customerEmail = order.customer?.email || '';
                    const customerPhone = order.customer?.phone || '';

                    const isUpdating = updatingId === order._id;
                    const isTerminal = currentStatus === 'Completed' || currentStatus === 'Cancelled';
                    const allowedStatuses = VALID_TRANSITIONS[currentStatus] || [];

                    // Composed items summary
                    const itemsText = Array.isArray(order.items) && order.items.length > 0
                      ? order.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')
                      : 'No items recorded';

                    return (
                      <tr key={order._id || order.orderNumber}>
                        {/* Order ID */}
                        <td className="order-id-cell">
                          <span className="order-number-text">{order.orderNumber || order._id}</span>
                          <span className="order-type-tag">
                            {order.orderType || 'Order'}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="order-customer-cell">
                          <div className="customer-name-text">{customerName}</div>
                          {customerEmail && (
                            <div className="customer-sub-text">{customerEmail}</div>
                          )}
                          {customerPhone && (
                            <div className="customer-sub-text">{customerPhone}</div>
                          )}
                        </td>

                        {/* Items */}
                        <td className="order-items-cell" title={itemsText}>
                          <div className="order-items-snippet">
                            {itemsText}
                          </div>
                        </td>

                        {/* Total in LKR */}
                        <td className="order-total-cell">
                          <strong>{formatLKR(order.total)}</strong>
                        </td>

                        {/* Payment Status */}
                        <td>
                          <PaymentBadge status={order.paymentStatus} />
                        </td>

                        {/* Date */}
                        <td className="order-date-cell">
                          {formatDate(order.createdAt)}
                        </td>

                        {/* Status / Actions */}
                        <td className="order-status-cell">
                          <div className="status-dropdown-wrapper">
                            <select
                              className={`order-status-select status-${currentStatus.toLowerCase().replace(/\s+/g, '-')} ${
                                isUpdating ? 'status-updating' : ''
                              }`}
                              value={currentStatus}
                              disabled={isUpdating || isTerminal}
                              title={
                                isTerminal
                                  ? `Status "${currentStatus}" is final and cannot be modified.`
                                  : `Current status: ${currentStatus}`
                              }
                              onChange={(e) =>
                                handleStatusChange(order._id, currentStatus, e.target.value)
                              }
                            >
                              {/* Current status option */}
                              <option value={currentStatus}>
                                {currentStatus} (Current)
                              </option>

                              {/* Allowed transition options */}
                              {ALL_STATUSES.filter((s) => s !== currentStatus).map((s) => {
                                const isValid = allowedStatuses.includes(s);
                                return (
                                  <option
                                    key={s}
                                    value={s}
                                    disabled={!isValid}
                                  >
                                    {s} {!isValid ? '(Invalid)' : ''}
                                  </option>
                                );
                              })}
                            </select>

                            {isUpdating && (
                              <span className="dropdown-spinner" title="Updating status..." />
                            )}
                          </div>
                          {isTerminal && (
                            <span className="terminal-note">Final state</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="orders-pagination-bar">
              <div className="pagination-info">
                Showing <strong>{startRecord}</strong> to <strong>{endRecord}</strong> of{' '}
                <strong>{pagination.total}</strong> orders
              </div>

              <div className="pagination-actions">
                <button
                  type="button"
                  className="pagination-btn"
                  disabled={pagination.page <= 1 || loading}
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                  <span>Prev</span>
                </button>

                <div className="pagination-pages">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                    .filter((p) => {
                      // Show current page, edges, and adjacent pages
                      return (
                        p === 1 ||
                        p === pagination.pages ||
                        Math.abs(p - pagination.page) <= 1
                      );
                    })
                    .map((pageNum, idx, arr) => {
                      const prevPage = arr[idx - 1];
                      const showEllipsis = prevPage && pageNum - prevPage > 1;

                      return (
                        <React.Fragment key={pageNum}>
                          {showEllipsis && <span className="pagination-ellipsis">...</span>}
                          <button
                            type="button"
                            className={`pagination-number-btn ${
                              pagination.page === pageNum ? 'active' : ''
                            }`}
                            onClick={() => setPagination((prev) => ({ ...prev, page: pageNum }))}
                          >
                            {pageNum}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>

                <button
                  type="button"
                  className="pagination-btn"
                  disabled={pagination.page >= pagination.pages || loading}
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  aria-label="Next page"
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
