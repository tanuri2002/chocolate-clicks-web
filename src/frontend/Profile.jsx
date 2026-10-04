import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../api';
import './Profile.css';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getCurrentUser();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          throw new Error('Failed to load profile');
        }
      } catch (err) {
        setError(err.message || 'Error loading profile');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <p className="profile-loading">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <p className="profile-error">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {getInitials(user?.fullName)}
            </div>
            <div className="profile-title">
              <h1>{user?.fullName}</h1>
              <span className={`profile-badge ${user?.role === 'admin' ? 'admin' : 'customer'}`}>
                {user?.role === 'admin' ? 'Admin' : 'Customer'}
              </span>
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-row">
              <span className="detail-label">Full name</span>
              <span className="detail-value">{user?.fullName}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email</span>
              <span className="detail-value">{user?.email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Phone No</span>
              <span className="detail-value" style={{ textTransform: 'capitalize' }}>{user?.phoneNo}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Address</span>
              <span className="detail-value" style={{ textTransform: 'capitalize' }}>{user?.address}</span>
            </div>
            {user?.createdAt && (
              <div className="detail-row">
                <span className="detail-label">Member since</span>
                <span className="detail-value">{formatDate(user.createdAt)}</span>
              </div>
            )}
          </div>

          <div className="profile-actions">
            <Link to="/forgot-password" className="profile-btn-outline">
              Change password
            </Link>
            <button onClick={handleLogout} className="profile-btn-danger">
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
