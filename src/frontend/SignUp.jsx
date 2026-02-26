import React from 'react';
import signup from '../assets/signup.jpeg';
import './SignUp.css';

export default function SignUp() {
  return (
    <div className="signup-page">
      {/* Main content – side by side on large screens */}
      <div className="signup-container">
        {/* Left: Image – hidden on mobile, shown from lg breakpoint */}
        <div className="signup-image">
          <img
            src={signup}
            alt="Tray of gooey S'mores brownies with toasted marshmallows"
          />
        </div>

        {/* Right: Form – always visible, vertically centered */}
        <div className="signup-form-container">
          <div className="signup-form-wrapper">
            <h1 className="signup-title">
              Welcome to Chocolate Clicks!
            </h1>

            <form className="signup-form">
              <div className="form-group">
                <input id="firstName" type="text" required placeholder="First Name" />
              </div>

              <div className="form-group">
                <input id="lastName" type="text" required placeholder="Last Name" />
              </div>

              <div className="form-group">
                <input id="contactNumber" type="tel" required placeholder="Contact Number" />
              </div>

              <div className="form-group">
                <input id="email" type="email" required placeholder="Email" />
              </div>

              <div className="form-group">
                <input id="password" type="password" required placeholder="Password" />
              </div>

              <button type="submit" className="signup-button">
                Sign Up
              </button>
            </form>

            <p className="signup-footer">
              Have an Account?{' '}
              <a href="/login">Log In</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
