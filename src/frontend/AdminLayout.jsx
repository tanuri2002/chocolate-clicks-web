// src/frontend/AdminLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSubNav from './AdminSubNav';
import './Dashboard.css';

/**
 * Shared Admin Dashboard Layout that displays the persistent admin sub-nav
 * and embeds child views (Overview, Orders, Customers, Menu) via React Router Outlet.
 */
export default function AdminLayout() {
  return (
    <div className="dashboard-page">
      {/* Persistent Admin Header */}
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <div>
            <h1>Admin Dashboard</h1>
            <div className="dashboard-welcome">Orders & Store Management</div>
          </div>
        </div>
      </header>

      {/* Persistent Admin Sub-Nav */}
      <AdminSubNav />

      {/* Dynamic Sub-Page Content */}
      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
}
