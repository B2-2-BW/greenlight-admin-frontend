import { Link, useLocation, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { Button, Card, FieldError, Form, Input, Label, Switch, TextField } from '@heroui/react';
import logo from '/logo.png';
import { TokenUtil } from '../util/tokenUtil.js';
import { UserClient } from '../api/user/index.js';
import { ToastUtil } from '../util/toastUtil.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberUser, setRememberUser] = useState(false);
  const [errors, setErrors] = useState({});

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

    const response = await UserClient.login({ loginId, password });

    if (response.status === 401 || response.status === 404) {
      ToastUtil.error('로그인 실패', '아이디 또는 비밀번호가 잘못되었습니다.');
      return;
    } else if (!response?.data?.accessToken) {
      console.error('login failed', response);
      ToastUtil.error('로그인 실패', '잘못된 요청입니다. 관리자에게 문의해주세요. ' + response?.data?.message);
      return;
    }

    TokenUtil.saveToken(response.data.accessToken, rememberUser);

    const params = new URLSearchParams(search);
    const to = params.get('redirect') || '/'; // redirect가 있다면 해당 url로 없다면 /로 이동

    navigate(to);
  };

  useEffect(() => {
    document.title = '로그인 | Greenlight Admin';
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Card className="px-8 py-8 shadow-[0_0_24px_0_rgba(0,0,0,0.15)]">
        <Card.Header className="flex flex-col items-start">
          <img className="w-28" src={logo} alt="GreenLight Logo" />
          <span className="text-3xl font-bold mt-8 mb-4">로그인</span>
          <div className="flex text-sm gap-4 mb-4">
            <span className="text-neutral-500">신규 사용자이신가요?</span>
            <span className="text-green-700">
              <Link to="/signin">계정 신청하기</Link>
            </span>
          </div>
        </Card.Header>
        <Card.Content className="w-[400px]">
          <Form onSubmit={handleLogin} validationErrors={errors} className="flex flex-col gap-2">
            <TextField name="username" type="text" variant="secondary">
              <Input
                placeholder="사용자 ID"
                className="py-3"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
              />
              <FieldError>사용자 ID는 필수값입니다.</FieldError>
            </TextField>

            <TextField name="password" type="password" variant="secondary">
              <Input
                placeholder="비밀번호"
                className="py-3"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <FieldError>사용자 비밀번호는 필수값입니다.</FieldError>
            </TextField>

            <Switch
              className="mt-4 mb-8"
              color="primary"
              name="rememberUser"
              isSelected={rememberUser}
              onChange={setRememberUser}
            >
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
              <Switch.Content>
                <Label className="text-neutral-500 cursor-pointer">로그인 유지</Label>
              </Switch.Content>
            </Switch>
            <Button className="h-12" color="primary" type="submit" fullWidth isLoading={false}>
              <span className="text-medium">로그인</span>
            </Button>
          </Form>
        </Card.Content>

        <Card.Footer></Card.Footer>
      </Card>
    </div>
  );
}
