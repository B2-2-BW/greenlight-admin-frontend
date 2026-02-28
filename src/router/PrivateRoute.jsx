import { Navigate, useLocation } from 'react-router';
import { TokenUtil } from '../util/tokenUtil.js';
import { useUserStore } from '../store/user.jsx';
import { UserClient } from '../api/user/index.js';

// 인증처리 담당 Route
function PrivateRoute({ children }) {
  const { pathname } = useLocation();
  const { setUser } = useUserStore();

  const token = TokenUtil.getToken();
  const result = TokenUtil.validateJwt(token);
  if (!result?.valid) {
    if (result?.error != null) {
      console.error(result.error);
    }
    const to = { pathname: '/login', search: `?redirect=${pathname}` };
    return <Navigate to={to} replace />;
  }

  const me = useUserStore.getState().user;
  if (me == null) {
    UserClient.me().then((user) => {
      console.log(user);
      setUser(user);
    });
  }

  return children;
}

export default PrivateRoute;
