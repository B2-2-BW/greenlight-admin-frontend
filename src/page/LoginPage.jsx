import { Link, useLocation, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { Button, Card, FieldError, Form, Input, Label, Switch, TextField } from '@heroui/react';
import logo from '/logo.png';
import { LoginUtil } from '../util/loginUtil.js';
import { UserClient } from '../api/user/index.js';
import { ToastUtil } from '../util/toastUtil.js';
import { usePreferenceStore } from '../store/preference.jsx';
import { useUserStore } from '../store/user.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberUser, setRememberUser] = useState(false);
  const [errors, setErrors] = useState({});
  const { updateLoginPreference } = usePreferenceStore();

  const { setUser } = useUserStore();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!loginId) {
      setErrors({ username: true });
      return;
    }

    if (!password) {
      setErrors({ password: true });
      return;
    }

    const response = await UserClient.login({ loginId, password, autoLogin: rememberUser });

    if (response.status === 401 || response.status === 403 || response.status === 404) {
      ToastUtil.error('로그인 실패', response?.data?.detail || '아이디 또는 비밀번호가 잘못되었습니다.');
      return;
    } else if (!response?.data?.accessToken) {
      console.error('login failed', response);
      ToastUtil.error('로그인 실패', '잘못된 요청입니다. 관리자에게 문의해주세요. ' + response?.data?.message);
      return;
    }

    LoginUtil.setAccessToken(response.data.accessToken);
    const loginResponse = await UserClient.me();
    if (loginResponse.status === 200) {
      setUser(loginResponse.data);
    } else {
      console.error('fetch failed', loginResponse);
      ToastUtil.error(
        '사용자 정보 조회 실패',
        '사용자 정보를 불러오는 데에 실패했습니다. 관리자에게 문의해주세요. ' + loginResponse?.data?.message
      );
      return;
    }

    updateLoginPreference({ autoLogin: rememberUser });

    if (loginResponse.data?.passwordResetRequired) {
      return;
    }

    const params = new URLSearchParams(search);
    const to = params.get('redirect') || '/'; // redirect가 있다면 해당 url로 없다면 /로 이동

    navigate(to);
  };

  useEffect(() => {
    document.title = '로그인 | Greenlight Admin';
  }, []);

  return (
    <main className="flex min-h-dvh w-full items-center justify-center overflow-y-auto p-4 sm:p-6">
      <Card className="my-auto w-full max-w-md px-5 py-6 shadow-[0_0_24px_0_rgba(0,0,0,0.15)] sm:px-8 sm:py-8">
        <Card.Header className="flex flex-col items-start">
          <img className="w-28" src={logo} alt="GreenLight Logo" />
          <h1 className="mb-4 mt-8 text-2xl font-bold sm:text-3xl">로그인</h1>
          <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <span className="text-neutral-500">신규 사용자이신가요?</span>
            <span className="text-green-700">
              <Link to="/signin">계정 신청하기</Link>
            </span>
          </div>
        </Card.Header>
        <Card.Content className="w-full min-w-0">
          <Form onSubmit={handleLogin} validationErrors={errors} className="flex flex-col gap-2">
            <TextField name="username" type="text" variant="secondary">
              <Label>사용자 ID</Label>
              <Input
                placeholder="사용자 ID"
                className="py-3"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
              />
              <FieldError>사용자 ID는 필수값입니다.</FieldError>
            </TextField>

            <TextField name="password" type="password" variant="secondary">
              <Label>비밀번호</Label>
              <Input
                placeholder="비밀번호"
                className="py-3"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <FieldError>사용자 비밀번호는 필수값입니다.</FieldError>
            </TextField>

            <Switch className="mt-4 mb-8" name="rememberUser" isSelected={rememberUser} onChange={setRememberUser}>
              <Switch.Content>
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
                <span className="text-neutral-500">로그인 유지</span>
              </Switch.Content>
            </Switch>
            <Button className="h-12" type="submit" fullWidth>
              <span className="text-medium">로그인</span>
            </Button>
          </Form>
        </Card.Content>

        <Card.Footer></Card.Footer>
      </Card>
    </main>
  );
}
