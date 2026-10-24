// src/frontend/CustomersPlaceholder.jsx
import React, { useEffect, useState, useMemo } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  AlertCircle,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  DollarSign,
  UserCheck,
} from 'lucide-react';
import { getAdminCustomers } from '../api';
import { formatLKR } from './DashboardOverview';
import './Dashboard.css';

/**
 * Format registration date into readable format
 */
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Get initials from a full name (e.g. "Chandima Sandamali" -> "CS")
 */
function getInitials(name = '') {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return 'C';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Customers page (/dashboard/customers)
 * Displays all registered non-admin users retrieved from the users collection.
 */
export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Fetch customers from backend
  async function loadCustomers() {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await getAdminCustomers();
      if (data.success && Array.isArray(data.customers)) {
        setCustomers(data.customers);
      } else {
        setCustomers([]);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
      setErrorMessage(err.message || 'Failed to retrieve customers.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  // Filter customers based on search query
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const q = searchQuery.toLowerCase().trim();
    return customers.filter((c) => {
      const name = (c.fullName || '').toLowerCase();
      const email = (c.email || '').toLowerCase();
      const phone = String(c.phoneNo || '').toLowerCase();
      const addr = (c.address || '').toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q) || addr.includes(q);
    });
  }, [customers, searchQuery]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = customers.length;
    const withOrders = customers.filter((c) => (c.ordersCount || 0) > 0).length;
    const totalRevenue = customers.reduce((acc, c) => acc + (c.totalSpent || 0), 0);
    return { total, withOrders, totalRevenue };
  }, [customers]);

  return (
    <div className="orders-page-container">
      {/* Title & Actions Bar */}
      <div className="orders-page-header">
        <div className="orders-header-title">
          <h2>
            <Users size={22} className="icon-orange" /> Customers Management
          </h2>
          <span className="orders-total-badge">
            {filteredCustomers.length} Customer{filteredCustomers.length !== 1 ? 's' : ''}
          </span>
        </div>

        <button
          className="admin-btn-secondary"
          onClick={loadCustomers}
          disabled={loading}
          title="Refresh customers list"
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
          <button
            className="admin-alert-close"
            onClick={() => setErrorMessage('')}
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="kpi-cards" style={{ marginBottom: '1.5rem' }}>
        <div className="summary-card">
          <div className="summary-icon icon-orange">
            <Users size={24} />
          </div>
          <div className="summary-content">
            <div className="summary-label">Total Customers</div>
            <div className="summary-value">{stats.total}</div>
            <div className="summary-subtitle">Registered non-admin accounts</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon icon-green">
            <UserCheck size={24} />
          </div>
          <div className="summary-content">
            <div className="summary-label">Active Buyers</div>
            <div className="summary-value">{stats.withOrders}</div>
            <div className="summary-subtitle">
              {stats.total > 0 ? Math.round((stats.withOrders / stats.total) * 100) : 0}% converted
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon icon-blue">
            <DollarSign size={24} />
          </div>
          <div className="summary-content">
            <div className="summary-label">Total Customer Revenue</div>
            <div className="summary-value">{formatLKR(stats.totalRevenue)}</div>
            <div className="summary-subtitle">From all registered orders</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="orders-controls-bar">
        <div className="orders-search-box" style={{ maxWidth: '480px' }}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by customer name, email, phone, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="orders-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              className="orders-search-clear"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Customers Table Container */}
      <div className="customers-card orders-table-card">
        {loading && customers.length === 0 ? (
          <div className="admin-loading-state">
            <div className="admin-spinner" />
            <p>Loading customers from database...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="admin-empty-state">
            <Users size={40} className="empty-icon" />
            <h3>No customers found</h3>
            <p>
              {searchQuery
                ? 'No registered customers match your search criteria.'
                : 'There are currently no registered customers in the database.'}
            </p>
            {searchQuery && (
              <button className="view-all-btn" onClick={() => setSearchQuery('')}>
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="customers-table-wrapper">
            <table className="customers-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact Info</th>
                  <th>Address</th>
                  <th>Joined Date</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => {
                  const initials = getInitials(customer.fullName);
                  return (
                    <tr
                      key={customer._id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedCustomer(customer)}
                      title="Click to view details"
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              backgroundColor: '#262626',
                              border: '1px solid #c98b3b',
                              color: '#c98b3b',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '600',
                              fontSize: '0.85rem',
                              flexShrink: 0,
                            }}
                          >
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: '#f3f4f6' }}>
                              {customer.fullName || 'Unnamed Customer'}
                            </div>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                color: '#10b981',
                                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                display: 'inline-block',
                                marginTop: '3px',
                              }}
                            >
                              Customer
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              color: '#d1d5db',
                            }}
                          >
                            <Mail size={13} color="#9ca3af" />
                            <a
                              href={`mailto:${customer.email}`}
                              onClick={(e) => e.stopPropagation()}
                              style={{ color: '#d1d5db', textDecoration: 'none' }}
                            >
                              {customer.email}
                            </a>
                          </div>
                          {customer.phoneNo ? (
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                color: '#9ca3af',
                                fontSize: '0.8rem',
                              }}
                            >
                              <Phone size={13} color="#9ca3af" />
                              <span>{customer.phoneNo}</span>
                            </div>
                          ) : (
                            <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                              No phone provided
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <div
                          style={{
                            maxWidth: '220px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            color: customer.address ? '#d1d5db' : '#6b7280',
                          }}
                          title={customer.address || 'No address provided'}
                        >
                          {customer.address ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={13} color="#c98b3b" />
                              {customer.address}
                            </span>
                          ) : (
                            'Not provided'
                          )}
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9ca3af' }}>
                          <Calendar size={13} />
                          <span>{formatDate(customer.createdAt)}</span>
                        </div>
                      </td>

                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 10px',
                            borderRadius: '9999px',
                            fontSize: '0.78rem',
                            fontWeight: '600',
                            backgroundColor:
                              (customer.ordersCount || 0) > 0
                                ? 'rgba(201, 139, 59, 0.15)'
                                : 'rgba(107, 114, 128, 0.15)',
                            color:
                              (customer.ordersCount || 0) > 0 ? '#c98b3b' : '#9ca3af',
                            border: `1px solid ${
                              (customer.ordersCount || 0) > 0
                                ? 'rgba(201, 139, 59, 0.3)'
                                : 'rgba(107, 114, 128, 0.3)'
                            }`,
                          }}
                        >
                          <ShoppingBag size={12} />
                          {customer.ordersCount || 0} order{(customer.ordersCount || 0) !== 1 ? 's' : ''}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontWeight: '600', color: '#f3f4f6' }}>
                          {formatLKR(customer.totalSpent || 0)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Quick View Modal */}
      {selectedCustomer && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setSelectedCustomer(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="admin-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '500px' }}
          >
            <div className="admin-modal-header">
              <h3>Customer Profile</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setSelectedCustomer(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: '#262626',
                    border: '2px solid #c98b3b',
                    color: '#c98b3b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '1.2rem',
                    flexShrink: 0,
                  }}
                >
                  {getInitials(selectedCustomer.fullName)}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#ffffff' }}>
                    {selectedCustomer.fullName}
                  </h4>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: '#10b981',
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      display: 'inline-block',
                      marginTop: '4px',
                    }}
                  >
                    Registered Customer
                  </span>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#161616',
                  borderRadius: '8px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  border: '1px solid #2a2a2a',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Mail size={16} color="#c98b3b" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Email Address</div>
                    <a
                      href={`mailto:${selectedCustomer.email}`}
                      style={{ color: '#f3f4f6', textDecoration: 'none' }}
                    >
                      {selectedCustomer.email}
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Phone size={16} color="#c98b3b" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Phone Number</div>
                    <div style={{ color: '#f3f4f6' }}>
                      {selectedCustomer.phoneNo || 'Not provided'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <MapPin size={16} color="#c98b3b" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Delivery / Home Address</div>
                    <div style={{ color: '#f3f4f6' }}>
                      {selectedCustomer.address || 'Not provided'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Calendar size={16} color="#c98b3b" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Member Since</div>
                    <div style={{ color: '#f3f4f6' }}>
                      {formatDate(selectedCustomer.createdAt)}
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#161616',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #2a2a2a',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Total Orders</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#c98b3b', marginTop: '4px' }}>
                    {selectedCustomer.ordersCount || 0}
                  </div>
                </div>
                <div
                  style={{
                    backgroundColor: '#161616',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #2a2a2a',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Total Spent</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#10b981', marginTop: '4px' }}>
                    {formatLKR(selectedCustomer.totalSpent || 0)}
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setSelectedCustomer(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
