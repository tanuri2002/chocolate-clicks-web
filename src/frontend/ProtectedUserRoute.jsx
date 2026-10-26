import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

export default function ProtectedUserRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            border: '3px solid rgba(255, 152, 0, 0.2)',
            borderTopColor: '#ff9800',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
          Verifying account authorization...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
