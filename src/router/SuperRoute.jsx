import { Navigate } from 'react-router';
import { useUserStore } from '../store/user.jsx';

export default function SuperRoute({ children }) {
  const role = useUserStore((state) => state.user?.userRole ?? state.user?.role);

  if (!role) return null;
  if (role !== 'SUPER') {
    return <Navigate to="/forbidden" replace />;
  }
  return children;
}
