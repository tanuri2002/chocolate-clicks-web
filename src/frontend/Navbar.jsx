// src/frontend/Navbar.jsx
import React from 'react';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">Chocolate Clicks</div>
      <div className="navbar-links">
        <a href="/">Home</a>
        <a href="/login">Log in</a>
        <a href="/signup">Sign up</a>
        <a href="/events">Items</a>
        <a href="/payment">Payment</a>
        <a href="/dashboard">Dashboard</a>
      </div>
    </nav>
  );
}
