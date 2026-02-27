import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* About Section */}
          <div className="footer-about">
            <h3 className="footer-title">Chocolate Clicks</h3>
            <p className="footer-text">
              Crafting premium chocolate treats for every celebration. From cakes to brownies, each creation is made with love and the finest ingredients.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-links">
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-list">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/events">Events</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/signup">Sign Up</Link></li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="footer-contact">
            <h3 className="footer-title">Contact Us</h3>
            <ul className="footer-list">
              <li>Email: info@chocolateclicks.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Address: 123 Chocolate Lane, Sweet City, SC 12345</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-bottom">
          <p>&copy; 2024 Chocolate Clicks. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
