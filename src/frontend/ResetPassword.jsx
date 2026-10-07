import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { resetPassword } from '../api';
import './Login.css';
import login1 from '../assets/login1.jpeg';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const data = await resetPassword(token, newPassword);
      setMessage(data.message);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Server error');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="login-form-container" style={{ width: '100%', maxWidth: '100%' }}>
            <div className="login-form-wrapper" style={{ margin: '0 auto' }}>
              <h1 className="login-title" style={{ textAlign: 'center' }}>Invalid Request</h1>
              <p style={{ color: 'crimson', textAlign: 'center' }}>No reset token provided.</p>
              <p className="login-footer" style={{ marginTop: '2rem' }}>
                <Link to="/forgot-password">Request a new reset link</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-image">
          <img src={login1} alt="Tray of gooey S'mores brownies" />
        </div>

        <div className="login-form-container">
          <div className="login-form-wrapper">
            <h1 className="login-title">Reset Password</h1>

            {message ? (
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <p style={{ color: '#4caf50', marginBottom: '1rem' }}>{message}</p>
                <p style={{ color: '#9ca3af' }}>Redirecting to login...</p>
              </div>
            ) : (
              <>
                <form className="login-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input id="newPassword" type="password" placeholder="New Password (min 6 chars)" required value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input id="confirmPassword" type="password" placeholder="Confirm Password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                  </div>

                  <button type="submit" className="login-button" disabled={loading}>
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>

                {error && <p style={{ color: 'crimson', textAlign: 'center' }}>{error}</p>}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
