import { Navigate, useLocation } from 'react-router';
import { LoginUtil } from '../util/loginUtil.js';

function PrivateRoute({ children }) {
  const { pathname } = useLocation();

  if (!LoginUtil.isTokenValid()) {
    alert('세션이 만료되었습니다!');

    const to = { pathname: '/login', search: `?redirect=${pathname}` };
    return <Navigate to={to} replace />;
  }

  return children;
}

export default PrivateRoute;
