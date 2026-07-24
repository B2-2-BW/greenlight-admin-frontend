import { Navigate } from 'react-router';
import { useUserStore } from '../store/user.jsx';

export default function AdminRoute({ children }) {
  const user = useUserStore((state) => state.user);
  const role = user?.userRole ?? user?.role;

  if (!role) return null;
  if (role !== 'SITE_ADMIN' && role !== 'SUPER') {
    return <Navigate to="/forbidden" replace />;
  }
  return children;
}
