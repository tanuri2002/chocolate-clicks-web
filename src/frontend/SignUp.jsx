import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import signup from '../assets/signup.jpeg';
import './SignUp.css';

export default function SignUp() {
  const [form, setForm] = useState({ firstName: '', lastName: '', contactNumber: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      setSuccess('Signup successful');
      setForm({ firstName: '', lastName: '', contactNumber: '', email: '', password: '' });
      setTimeout(() => navigate('/login'), 800);
    } catch (err) {
      setError(err.message || 'Server error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-image">
          <img src={signup} alt="Tray of gooey S'mores brownies with toasted marshmallows" />
        </div>

        <div className="signup-form-container">
          <div className="signup-form-wrapper">
            <h1 className="signup-title">Welcome to Chocolate Clicks!</h1>

            <form className="signup-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <input name="firstName" value={form.firstName} onChange={handleChange} type="text" required placeholder="First Name" />
              </div>

              <div className="form-group">
                <input name="lastName" value={form.lastName} onChange={handleChange} type="text" required placeholder="Last Name" />
              </div>

              <div className="form-group">
                <input name="contactNumber" value={form.contactNumber} onChange={handleChange} type="tel" placeholder="Contact Number" />
              </div>

              <div className="form-group">
                <input name="email" value={form.email} onChange={handleChange} type="email" required placeholder="Email" />
              </div>

              <div className="form-group">
                <input name="password" value={form.password} onChange={handleChange} type="password" required placeholder="Password" />
              </div>

              <button type="submit" className="signup-button" disabled={loading}>
                {loading ? 'Signing...' : 'Sign Up'}
              </button>
            </form>

            {error && <p style={{ color: 'crimson', textAlign: 'center' }}>{error}</p>}
            {success && <p style={{ color: 'lightgreen', textAlign: 'center' }}>{success}</p>}

            <p className="signup-footer">
              Have an Account? <Link to="/login">Log In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
