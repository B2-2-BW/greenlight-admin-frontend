import { Link, useLocation, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { addToast, Button, Card, CardBody, CardFooter, CardHeader, Form, Input, Switch } from '@heroui/react';
import logo from '/logo.png';
import { login } from '../api/user/index.js';
import { LoginUtil } from '../util/loginUtil.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberUser, setRememberUser] = useState(false);
  const [errors, setErrors] = useState({});

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!userId) {
      setErrors({ username: '사용자 ID는 필수값입니다.' });
      return;
    }

    const response = await login({ userId, password });

    if (response.status === 401 || response.status === 404) {
      addToast({
        title: '로그인 실패',
        description: '아이디 또는 비밀번호가 잘못되었습니다.',
        color: 'danger',
      });
      return;
    } else if (!response?.data?.accessToken) {
      console.error('login failed', response);
      addToast({
        title: '로그인 실패',
        description: '잘못된 요청입니다. 관리자에게 문의해주세요. ' + response?.data?.message,
        color: 'danger',
      });
      return;
    }

    LoginUtil.saveToken(response.data.accessToken, rememberUser);

    const params = new URLSearchParams(search);
    const to = params.get('redirect') || '/'; // redirect가 있다면 해당 url로 없다면 /로 이동

    navigate(to);
  };

  useEffect(() => {
    document.title = '로그인 | Greenlight Admin';
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Card className="px-8 py-8">
        <CardHeader className="flex flex-col items-start">
          <img className="w-28" src={logo} alt="GreenLight Logo" />
          <span className="text-3xl font-bold mt-8 mb-4">로그인</span>
          <div className="flex text-small gap-4">
            <span className="text-default-500">신규 사용자이신가요?</span>
            <span className="text-green-700">
              <Link to="#">계정 신청하기</Link>
            </span>
          </div>
          <span className="text-default-500 text-sm">테스트계정은 admin/admin 입니다.</span>
        </CardHeader>
        <CardBody className="w-[400px]">
          <Form onSubmit={handleLogin} validationErrors={errors}>
            <Input
              size="sm"
              errorMessage="사용자 ID는 필수값입니다."
              label="사용자 ID"
              radius="sm"
              name="username"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
            <Input
              size="sm"
              errorMessage="사용자 비밀번호는 필수값입니다."
              label="비밀번호"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Switch
              className="mt-2 mb-8"
              color="primary"
              size="sm"
              name="rememberUser"
              checked={rememberUser}
              onChange={(e) => setRememberUser(e.target.checked)}
            >
              <span className="text-default-500">로그인 유지</span>
            </Switch>
            <Button className="h-12" color="primary" type="submit" fullWidth isLoading={false}>
              <span className="text-medium">로그인</span>
            </Button>
          </Form>
        </CardBody>

        <CardFooter></CardFooter>
      </Card>
    </div>
  );
}
