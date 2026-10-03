// src/frontend/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, isAdmin, logout } from '../api';
import './Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();
  const admin = isAdmin();

  function handleLogout() {
    logout();
    navigate('/');
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
        {loggedIn ? (
          <button className="navbar-logout" onClick={handleLogout}>Log out</button>
        ) : (
          <Link to="/login">Log in</Link>
        )}
        {/* <Link to="/signup">Sign up</Link> */}
      </div>
    </nav>
  );
}
