// src/frontend/Navbar.jsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [openPath, setOpenPath] = useState(null);
  const { pathname } = useLocation();
  const isOpen = openPath === pathname;

  return (
    <nav className="navbar" aria-label="Main navigation" onKeyDown={(event) => {
      if (event.key === 'Escape' && isOpen) {
        setOpenPath(null);
        event.currentTarget.querySelector('.navbar-toggle').focus();
      }
    }}>
      <Link className="navbar-logo" to="/" onClick={() => setOpenPath(null)}>Chocolate Clicks</Link>
      <button
        className="navbar-toggle"
        type="button"
        aria-expanded={isOpen}
        aria-controls="main-navigation-links"
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        onClick={() => setOpenPath(isOpen ? null : pathname)}
      >
        <span aria-hidden="true">{isOpen ? '✕' : '☰'}</span>
        <span>Menu</span>
      </button>
      <div id="main-navigation-links" className={`navbar-links${isOpen ? ' is-open' : ''}`} onClick={() => setOpenPath(null)}>
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
