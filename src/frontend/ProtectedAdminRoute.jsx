import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../api';

export default function ProtectedAdminRoute({ children }) {
  const [access, setAccess] = useState('checking');

  useEffect(() => {
    let cancelled = false;
    getCurrentUser()
      .then((user) => {
        if (!cancelled) setAccess(user?.role === 'admin' ? 'allowed' : 'denied');
      })
      .catch(() => {
        if (!cancelled) setAccess('denied');
      });
    return () => { cancelled = true; };
  }, []);

  if (access === 'checking') return <main className="admin-gate-status">Checking access...</main>;
  if (access === 'denied') return <Navigate to="/login" replace />;
  return children;
}