// src/frontend/MenuPlaceholder.jsx
import React from 'react';
import { UtensilsCrossed, Clock } from 'lucide-react';
import './Dashboard.css';

/**
 * Menu placeholder page (/dashboard/menu)
 * Serves as an aesthetic placeholder while Menu management is relocated to its dedicated tab.
 */
export default function MenuPlaceholder() {
  return (
    <div className="admin-placeholder-page">
      <div className="customers-card admin-placeholder-card">
        <div className="admin-placeholder-icon-wrap">
          <UtensilsCrossed size={36} className="icon-orange" />
        </div>
        <h2>Menu Management</h2>
        <p className="admin-placeholder-desc">
          Item creation, pricing, stock levels, and category organization will be accessible from this dedicated workspace in the next update.
        </p>
        <div className="admin-placeholder-badge">
          <Clock size={15} />
          <span>Coming Soon</span>
        </div>
      </div>
    </div>
  );
}
