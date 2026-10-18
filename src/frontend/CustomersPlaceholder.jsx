// src/frontend/CustomersPlaceholder.jsx
import React from 'react';
import { Users, Clock } from 'lucide-react';
import './Dashboard.css';

/**
 * Customers placeholder page (/dashboard/customers)
 * Serves as an aesthetic placeholder while Customers management is under development.
 */
export default function CustomersPlaceholder() {
  return (
    <div className="admin-placeholder-page">
      <div className="customers-card admin-placeholder-card">
        <div className="admin-placeholder-icon-wrap">
          <Users size={36} className="icon-orange" />
        </div>
        <h2>Customers Management</h2>
        <p className="admin-placeholder-desc">
          Customer insights, customer histories, and profile management features are currently being built and will appear here soon.
        </p>
        <div className="admin-placeholder-badge">
          <Clock size={15} />
          <span>Coming in Next Milestone</span>
        </div>
      </div>
    </div>
  );
}
