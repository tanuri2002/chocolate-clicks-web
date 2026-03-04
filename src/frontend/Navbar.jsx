// src/frontend/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">Chocolate Clicks</div>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/events">Our-Items</Link>
        <Link to="/payment">Payments</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/login">Log in</Link>
        {/* <Link to="/signup">Sign up</Link> */}
      </div>
    </nav>
  );
}
