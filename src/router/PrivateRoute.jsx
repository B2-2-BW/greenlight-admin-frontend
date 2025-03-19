import { useUserStore } from '../store/user.jsx';
import { useEffect } from 'react';
import { Navigate } from 'react-router';

function PrivateRoute({ children }) {
  const { user, setUser } = useUserStore();

  useEffect(() => {
    if (!user) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, [user, setUser]);

  if (!user?.username) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default PrivateRoute;
