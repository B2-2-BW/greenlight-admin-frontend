import { Navigate, useLocation } from 'react-router';
import { Alert, Button, Spinner } from '@heroui/react';
import { LoginUtil } from '../util/loginUtil.js';
import { useUserStore } from '../store/user.jsx';
import { UserClient } from '../api/user/index.js';
import { useEffect, useState } from 'react';

// 인증처리 담당 Route, 최상단에 Wrapper로 존재
function PrivateRoute({ children }) {
  const location = useLocation();
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);
  const [authStatus, setAuthStatus] = useState('checking');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      try {
        let accessToken = LoginUtil.getAccessToken();

        if (!accessToken) {
          await LoginUtil.issueAndSetAccessToken();
          accessToken = LoginUtil.getAccessToken();
        }

        let result = LoginUtil.validateJwt(accessToken);
        if (!result?.valid && result?.expired) {
          await LoginUtil.issueAndSetAccessToken();
          accessToken = LoginUtil.getAccessToken();
          result = LoginUtil.validateJwt(accessToken);
        }

        if (!result?.valid) {
          if (result?.error) {
            console.error(result.error);
          }
          LoginUtil.clearAccessToken();
          clearUser();
          if (!cancelled) setAuthStatus('unauthenticated');
          return;
        }

        const response = await UserClient.me();
        if (!cancelled) {
          if (response?.status === 200) {
            setUser(response.data);
            setAuthStatus('authenticated');
          } else {
            LoginUtil.clearAccessToken();
            clearUser();
            setAuthStatus('unauthenticated');
          }
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          if (error?.response?.status === 401 || error?.response?.status === 403) {
            LoginUtil.clearAccessToken();
            clearUser();
            setAuthStatus('unauthenticated');
          } else {
            setAuthStatus('service-error');
          }
        }
      }
    };

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [clearUser, retryCount, setUser]);

  if (authStatus === 'checking') {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner color="accent" size="lg" aria-label="로그인 상태 확인 중" />
      </div>
    );
  }

  if (authStatus === 'service-error') {
    return (
      <div className="flex min-h-dvh items-center justify-center p-4">
        <Alert status="danger" className="max-w-lg">
          <Alert.Content>
            <Alert.Title>서비스에 연결할 수 없습니다</Alert.Title>
            <Alert.Description>잠시 후 다시 시도해 주세요.</Alert.Description>
            <div className="mt-4">
              <Button
                onPress={() => {
                  setAuthStatus('checking');
                  setRetryCount((count) => count + 1);
                }}
              >
                다시 시도
              </Button>
            </div>
          </Alert.Content>
        </Alert>
      </div>
    );
  }

  if (authStatus === 'unauthenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
export default PrivateRoute;
