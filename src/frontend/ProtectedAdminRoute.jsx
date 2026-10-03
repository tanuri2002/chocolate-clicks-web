import { Navigate } from 'react-router-dom';
import { isAuthenticated, isAdmin } from '../api';

export default function ProtectedAdminRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
}
