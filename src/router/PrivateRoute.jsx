import { Navigate, useLocation } from 'react-router';
import { LoginUtil } from '../util/loginUtil.js';
import { useUserStore } from '../store/user.jsx';
import { UserClient } from '../api/user/index.js';
import { useEffect, useState } from 'react';

// 인증처리 담당 Route, 최상단에 Wrapper로 존재
function PrivateRoute({ children }) {
  const location = useLocation();
  const { user, setUser } = useUserStore();
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

        if (!cancelled) {
          if (result?.valid) {
            setAuthStatus('authenticated');
          } else {
            if (result?.error) {
              console.error(result.error);
            }
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
  }, [location.pathname]);

  useEffect(() => {
    let cancelled = false;

    if (authStatus !== 'authenticated' || user != null) return;

    UserClient.me()
      .then((me) => {
        if (cancelled) return;
        setUser(me);
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      cancelled = true;
    };
  }, [authStatus, user, setUser]);

  if (authStatus === 'checking') {
    return null; // 또는 로딩 스피너
  }

  if (authStatus === 'unauthenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
export default PrivateRoute;
