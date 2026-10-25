import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCurrentUser, logout } from '../../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(() => {
    return !!localStorage.getItem('token');
  });

  // Re-verify with backend /api/auth/me to ensure role & session haven't been tampered with
  const verifyAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const serverUser = await getCurrentUser();
      if (serverUser && serverUser.role) {
        setUser(serverUser);
        localStorage.setItem('user', JSON.stringify(serverUser));
      } else {
        throw new Error('User record missing or invalid');
      }
    } catch (err) {
      console.warn('Session verification error:', err.message);
      logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    verifyAuth();

    const handleAuthChange = () => {
      verifyAuth();
    };

    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [verifyAuth]);

  const loginUser = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    window.dispatchEvent(new Event('auth-change'));
  };

  const logoutUser = () => {
    logout();
    setUser(null);
    window.dispatchEvent(new Event('auth-change'));
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user && !!localStorage.getItem('token'),
    isAdmin: !!user && user.role === 'admin',
    loginUser,
    logoutUser,
    verifyAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
