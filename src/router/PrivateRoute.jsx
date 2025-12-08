import { Navigate, useLocation } from 'react-router';
import { LoginUtil } from '../util/loginUtil.js';

function PrivateRoute({ children }) {
  const { pathname } = useLocation();

  const token = LoginUtil.getToken();
  const result = LoginUtil.validateJwt(token);
  if (!result?.valid) {
    if (result?.error != null) {
      console.error(result.error);
    }
    const to = { pathname: '/login', search: `?redirect=${pathname}` };
    return <Navigate to={to} replace />;
  }

  return children;
}

export default PrivateRoute;
