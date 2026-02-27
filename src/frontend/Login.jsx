import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import login1 from '../assets/login1.jpeg';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      // store a simple session marker (user id) — replace with JWT/session in production
      if (data && data.id) {
        localStorage.setItem('userId', String(data.id));
      } else {
        localStorage.setItem('userId', 'logged-in');
      }

      navigate('/');
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
          <img src={login1} alt="Tray of gooey S'mores brownies with toasted marshmallows" />
        </div>

        <div className="login-form-container">
          <div className="login-form-wrapper">
            <h1 className="login-title">Login</h1>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input id="password" type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} />
              </div>

              <button type="submit" className="login-button" disabled={loading}>
                {loading ? 'Logging...' : 'Login'}
              </button>
            </form>

            {error && <p style={{ color: 'crimson', textAlign: 'center' }}>{error}</p>}

            <p className="login-footer">
              Don't have an account? <Link to="/signup">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
