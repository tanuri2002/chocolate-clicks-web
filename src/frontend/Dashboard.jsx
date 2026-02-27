// src/pages/Dashboard.jsx
import React from 'react';
import { Package, Clock, CheckCircle, Users } from 'lucide-react';
import './Dashboard.css';

// ─── Order Data ────────────────────────────────────────────────

const registeredCustomers = [
  { id: 1, name: "Sarah Johnson", email: "sarah@email.com", totalOrders: 5, totalSpent: 449.95, lastPurchase: "2 mins ago", status: "active" },
  { id: 2, name: "Michael Chen", email: "michael@email.com", totalOrders: 3, totalSpent: 224.97, lastPurchase: "15 mins ago", status: "active" },
  { id: 3, name: "Emma Williams", email: "emma@email.com", totalOrders: 8, totalSpent: 649.92, lastPurchase: "1 hour ago", status: "active" },
  { id: 4, name: "David Martinez", email: "david@email.com", totalOrders: 2, totalSpent: 99.98, lastPurchase: "2 hours ago", status: "active" },
  { id: 5, name: "Lisa Anderson", email: "lisa@email.com", totalOrders: 6, totalSpent: 389.94, lastPurchase: "3 hours ago", status: "inactive" },
  { id: 6, name: "James Wilson", email: "james@email.com", totalOrders: 1, totalSpent: 89.99, lastPurchase: "1 day ago", status: "inactive" },
  { id: 7, name: "Maria Garcia", email: "maria@email.com", totalOrders: 4, totalSpent: 299.96, lastPurchase: "2 days ago", status: "inactive" },
];

const recentOrders = [
  { id: "ORD-12847", customer: "Sarah Johnson",  product: "Dark Chocolate Truffles", amount: 89.99,  status: "Completed",  time: "2 mins ago"  },
  { id: "ORD-12846", customer: "Michael Chen",   product: "Chocolate Gift Box",       amount: 149.99, status: "Processing", time: "15 mins ago" },
  { id: "ORD-12845", customer: "Emma Williams",  product: "Milk Chocolate Bar",       amount: 24.99,  status: "Completed",  time: "1 hour ago"  },
  { id: "ORD-12844", customer: "David Martinez", product: "White Chocolate Cookies", amount: 34.99,  status: "Shipped",     time: "2 hours ago" },
  { id: "ORD-12843", customer: "Lisa Anderson",  product: "Chocolate Bonbons",       amount: 64.99,  status: "Cancelled",   time: "3 hours ago" },
];

export default function Dashboard() {
  // Calculate order statistics
  const totalOrders = recentOrders.length;
  const completedOrders = recentOrders.filter(order => order.status === "Completed").length;
  const pendingOrders = recentOrders.filter(order => order.status !== "Completed" && order.status !== "Cancelled").length;
  const cancelledOrders = recentOrders.filter(order => order.status === "Cancelled").length;
  const totalAmount = recentOrders.reduce((sum, order) => sum + order.amount, 0);

  // Calculate customer statistics
  const totalCustomers = registeredCustomers.length;
  const activeCustomers = registeredCustomers.filter(c => c.status === "active").length;
  const inactiveCustomers = registeredCustomers.filter(c => c.status === "inactive").length;
  const totalCustomerSpent = registeredCustomers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgOrderValue = (totalAmount / totalOrders).toFixed(2);

  return (
    <div className="dashboard-page">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <h1>Dashboard</h1>
          <div className="dashboard-welcome">Orders & Customer Management</div>
        </div>
      </header>

      <main className="dashboard-main">
        {/* Order Summary Cards */}
        <div className="summary-section">
          <h2 className="section-title">Order Summary</h2>
          <div className="order-summary-cards">
            <div className="summary-card">
              <div className="summary-icon" style={{ backgroundColor: '#1e40af' }}>
                <Package size={24} color="white" />
              </div>
              <div className="summary-content">
                <div className="summary-label">Total Orders</div>
                <div className="summary-value">{totalOrders}</div>
                <div className="summary-subtitle">All orders combined</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon" style={{ backgroundColor: '#16a34a' }}>
                <CheckCircle size={24} color="white" />
              </div>
              <div className="summary-content">
                <div className="summary-label">Completed Orders</div>
                <div className="summary-value">{completedOrders}</div>
                <div className="summary-subtitle">Claimed/Delivered</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon" style={{ backgroundColor: '#ea580c' }}>
                <Clock size={24} color="white" />
              </div>
              <div className="summary-content">
                <div className="summary-label">Pending Orders</div>
                <div className="summary-value">{pendingOrders}</div>
                <div className="summary-subtitle">Processing or Shipped</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon" style={{ backgroundColor: '#dc2626' }}>
                <Package size={24} color="white" />
              </div>
              <div className="summary-content">
                <div className="summary-label">Cancelled Orders</div>
                <div className="summary-value">{cancelledOrders}</div>
                <div className="summary-subtitle">Not completed</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon" style={{ backgroundColor: '#7c3aed' }}>
                <Package size={24} color="white" />
              </div>
              <div className="summary-content">
                <div className="summary-label">Total Revenue</div>
                <div className="summary-value">${totalAmount.toFixed(2)}</div>
                <div className="summary-subtitle">From all orders</div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Summary Cards */}
        <div className="summary-section">
          <h2 className="section-title">Customer Summary</h2>
          <div className="order-summary-cards">
            <div className="summary-card">
              <div className="summary-icon" style={{ backgroundColor: '#2563eb' }}>
                <Users size={24} color="white" />
              </div>
              <div className="summary-content">
                <div className="summary-label">Total Customers</div>
                <div className="summary-value">{totalCustomers}</div>
                <div className="summary-subtitle">Registered users</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon" style={{ backgroundColor: '#10b981' }}>
                <Users size={24} color="white" />
              </div>
              <div className="summary-content">
                <div className="summary-label">Active Customers</div>
                <div className="summary-value">{activeCustomers}</div>
                <div className="summary-subtitle">Recently purchased</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon" style={{ backgroundColor: '#6b7280' }}>
                <Users size={24} color="white" />
              </div>
              <div className="summary-content">
                <div className="summary-label">Inactive Customers</div>
                <div className="summary-value">{inactiveCustomers}</div>
                <div className="summary-subtitle">No recent purchases</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon" style={{ backgroundColor: '#f59e0b' }}>
                <Package size={24} color="white" />
              </div>
              <div className="summary-content">
                <div className="summary-label">Avg Order Value</div>
                <div className="summary-value">${avgOrderValue}</div>
                <div className="summary-subtitle">Per order amount</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon" style={{ backgroundColor: '#8b5cf6' }}>
                <Package size={24} color="white" />
              </div>
              <div className="summary-content">
                <div className="summary-label">Customer Revenue</div>
                <div className="summary-value">${totalCustomerSpent.toFixed(2)}</div>
                <div className="summary-subtitle">Total spent</div>
              </div>
            </div>
          </div>
        </div>

        {/* Registered Customers List */}
        <div className="customers-card">
          <div className="customers-header">
            <h2><Users size={18} className="icon-orange"/> Registered Customers</h2>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="customers-table-wrapper">
            <table className="customers-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Email</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                  <th>Last Purchase</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {registeredCustomers.map(customer => (
                  <tr key={customer.id}>
                    <td>{customer.name}</td>
                    <td>{customer.email}</td>
                    <td>{customer.totalOrders}</td>
                    <td>${customer.totalSpent.toFixed(2)}</td>
                    <td>{customer.lastPurchase}</td>
                    <td>
                      <span className={`customer-status ${customer.status}`}>
                        {customer.status === 'active' ? '🟢 Active' : '⚫ Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Orders Full Width */}
        <div className="recent-orders-card">
          <div className="recent-orders-header">
            <h2><Package size={18} className="icon-orange"/> Recent Orders</h2>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="orders-list">
            {recentOrders.map(order => (
              <div key={order.id} className="order-item">
                <div>
                  <div className="order-title">{order.id}</div>
                  <div className="order-product">{order.customer}</div>
                  <div className="order-details">
                    <span>{order.product}</span>
                    <span className="order-time">{order.time}</span>
                  </div>
                </div>
                <div className="order-right">
                  <div className="order-amount">${order.amount.toFixed(2)}</div>
                  <span className={`order-status ${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
