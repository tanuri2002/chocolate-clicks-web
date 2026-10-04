import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../api';

export default function ProtectedUserRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
