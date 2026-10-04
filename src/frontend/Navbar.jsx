// src/frontend/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, isAdmin, logout } from '../api';
import { useCart } from './context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();
  const admin = isAdmin();
  const { totalItems, openCart } = useCart();

  function handleLogout() {
    logout();
    navigate('/');
  }

  function handleCartClick() {
    openCart();
  }

  return (
    <nav className="navbar">
      <div className="navbar-logo">Chocolate Clicks</div>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/events">Our-Items</Link>
        {/* <Link to="/payment">Payments</Link> */}
        {admin && <Link to="/dashboard">Dashboard</Link>}
        {loggedIn && <Link to="/profile">Profile</Link>}
        {loggedIn ? (
          <button className="navbar-logout" onClick={handleLogout}>Log out</button>
        ) : (
          <Link to="/login">Log in</Link>
        )}
        {/* <Link to="/signup">Sign up</Link> */}

        {/* ── Cart icon ── */}
        <button
          className="navbar-cart-btn"
          onClick={handleCartClick}
          aria-label={`Cart, ${totalItems} item${totalItems !== 1 ? 's' : ''}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {totalItems > 0 && (
            <span className="navbar-cart-badge" aria-hidden="true">
              {totalItems > 99 ? '99+' : totalItems}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}
