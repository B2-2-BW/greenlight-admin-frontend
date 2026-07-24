import { Navigate, useLocation } from 'react-router';
import { LoginUtil } from '../util/loginUtil.js';
import { useUserStore } from '../store/user.jsx';
import { UserClient } from '../api/user/index.js';
import { useEffect, useState } from 'react';

// 인증처리 담당 Route, 최상단에 Wrapper로 존재
function PrivateRoute({ children }) {
  const location = useLocation();
  const setUser = useUserStore((state) => state.setUser);
  const [authStatus, setAuthStatus] = useState('checking');

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      try {
        let accessToken = LoginUtil.getAccessToken();

        if (!accessToken) {
          await LoginUtil.issueAndSetAccessToken();
          accessToken = LoginUtil.getAccessToken();
        }

        const result = LoginUtil.validateJwt(accessToken);

        if (!result?.valid) {
          if (result?.error) {
            console.error(result.error);
          }
          if (!cancelled) setAuthStatus('unauthenticated');
          return;
        }

        const response = await UserClient.me();
        if (!cancelled) {
          if (response?.status === 200) {
            setUser(response.data);
            setAuthStatus('authenticated');
          } else {
            setAuthStatus('unauthenticated');
          }
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setAuthStatus('unauthenticated');
        }
      }
    };

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, setUser]);

  if (authStatus === 'checking') {
    return null; // 또는 로딩 스피너
  }

  if (authStatus === 'unauthenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
export default PrivateRoute;
