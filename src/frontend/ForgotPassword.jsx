import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api';
import './Login.css';
import login1 from '../assets/login1.jpeg';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const data = await forgotPassword(email);
      setMessage(data.message);
    } catch (err) {
      setError(err.message || 'Server error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-image">
          <img src={login1} alt="Tray of gooey S'mores brownies" />
        </div>

        <div className="login-form-container">
          <div className="login-form-wrapper">
            <h1 className="login-title">Forgot Password</h1>

            {message ? (
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <p style={{ color: '#4caf50', marginBottom: '1rem' }}>{message}</p>
                <p className="login-footer">
                  <Link to="/login">Back to Login</Link>
                </p>
              </div>
            ) : (
              <>
                <p style={{ color: '#9ca3af', marginBottom: '1rem', textAlign: 'center' }}>
                  Enter your email address and we will send you a link to reset your password.
                </p>
                <form className="login-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input id="email" type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} />
                  </div>

                  <button type="submit" className="login-button" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>

                {error && <p style={{ color: 'crimson', textAlign: 'center' }}>{error}</p>}

                <p className="login-footer">
                  Remember your password? <Link to="/login">Login</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
