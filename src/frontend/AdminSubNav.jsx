// src/frontend/AdminSubNav.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Users, UtensilsCrossed, CalendarDays } from 'lucide-react';
import './Dashboard.css';

/**
 * Admin navigation bar shown on all admin dashboard pages:
 * - Overview (/dashboard)
 * - Orders (/dashboard/orders)
 * - Events (/dashboard/events)
 * - Customers (/dashboard/customers)
 * - Menu (/dashboard/menu)
 */
export default function AdminSubNav() {
  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard, end: true },
    { label: 'Orders', path: '/dashboard/orders', icon: ShoppingBag, end: false },
    { label: 'Customers', path: '/dashboard/customers', icon: Users, end: false },
    { label: 'Menu', path: '/dashboard/menu', icon: UtensilsCrossed, end: false },
    { label: 'Events', path: '/dashboard/events', icon: CalendarDays, end: false },
  ];

  return (
    <nav className="admin-subnav" aria-label="Admin navigation">
      <div className="admin-subnav-container">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `admin-subnav-link ${isActive ? 'active' : ''}`
              }
            >
              <IconComponent size={18} className="admin-subnav-icon" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
