import React from 'react';
import './Login.css';
import login1 from '../assets/login1.jpeg';

export default function Login() {
  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left: Image */}
        <div className="login-image">
          <img
            src={login1}
            alt="Tray of gooey S'mores brownies with toasted marshmallows"
          />
        </div>

        {/* Right: Form */}
        <div className="login-form-container">
          <div className="login-form-wrapper">
            <h1 className="login-title">Login</h1>

            <form className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Password"
                  required
                />
              </div>

              <button type="submit" className="login-button">
                Login
              </button>
            </form>

            <p className="login-footer">
              Have an account?{' '}
              <a href="/signup">Sign in</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
