import { Button, Card, Separator, Form, Input, TextField, Label, FieldError, Description } from '@heroui/react';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import logo from '/logo.png';
import { UserClient } from '../api/user/index.js';
import { ToastUtil } from '../util/toastUtil.js';

const USER_ID_PATTERN = /^[A-Za-z0-9]+$/;
const USERNAME_PATTERN = /^[A-Za-z가-힣]+(?: [A-Za-z가-힣]+)*$/;

export default function SigninPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignin = async (e) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    const validationErrors = {};
    const userIdError = !USER_ID_PATTERN.test(userId.trim());
    if (!password || password.length < 8) validationErrors.password = true;
    if (password !== passwordConfirm) validationErrors.passwordConfirm = true;
    const usernameError = !USERNAME_PATTERN.test(username.trim());
    if (!email.trim()) validationErrors.email = true;

    if (Object.keys(validationErrors).length > 0 || userIdError || usernameError) {
      setErrors(validationErrors);
      if (validationErrors.passwordConfirm) {
        ToastUtil.error('비밀번호 확인', '비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      }
      return;
    }

    setIsSubmitting(true);
    const response = await UserClient.signin({
      userId: userId.trim(),
      username: username.trim(),
      userEmail: email.trim(),
      password,
    });
    setIsSubmitting(false);

    if (response?.status === 201) {
      ToastUtil.success('가입 신청 완료', '관리자 승인 후 로그인할 수 있습니다.');
      navigate('/login');
      return;
    }

    const message =
      response?.data?.message || '가입 신청에 실패했습니다. 입력 정보를 확인하거나 관리자에게 문의해 주세요.';
    ToastUtil.error('가입 신청 실패', message);
  };

  useEffect(() => {
    document.title = '회원가입 | Greenlight Admin';
  }, []);

  return (
    <main className="flex min-h-dvh w-full items-start justify-center overflow-y-auto p-4 sm:items-center sm:p-6">
      <Card className="my-auto w-full max-w-2xl px-5 py-6 shadow-[0_0_24px_0_rgba(0,0,0,0.15)] sm:px-8 sm:py-8">
        <Card.Header className="flex flex-col items-start">
          <button
            type="button"
            className="rounded-lg cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            aria-label="홈으로 이동"
            onClick={() => navigate('/')}
          >
            <img className="w-28" src={logo} alt="GreenLight Logo" />
          </button>
          <h1 className="mb-4 mt-8 text-2xl font-bold sm:text-3xl">회원가입</h1>
        </Card.Header>
        <Card.Content className="w-full min-w-0">
          <Form onSubmit={handleSignin} validationErrors={errors} className="flex flex-col gap-4">
            <TextField
              name="userId"
              type="text"
              isRequired
              value={userId}
              onChange={setUserId}
              pattern={USER_ID_PATTERN.source}
              className="w-full max-w-2xl"
              variant="default"
            >
              <Label className="text-base">아이디</Label>
              <Input
                className="ring-1 ring-neutral-200 focus:ring-2 focus:ring-accent"
                placeholder="로그인에 사용할 아이디를 입력하세요."
              />
              <Description className="text-sm">영문과 숫자만 사용할 수 있습니다.</Description>
              <FieldError>아이디는 필수이며 영문과 숫자만 사용할 수 있습니다.</FieldError>
            </TextField>

            <TextField name="password" type="password" isRequired className="w-full max-w-2xl" variant="default">
              <Label className="text-base">비밀번호</Label>
              <Input
                className="ring-1 ring-neutral-200 focus:ring-2 focus:ring-accent"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                placeholder="비밀번호를 입력해주세요."
              />
              <Description className="text-sm">
                8자 이상으로, 다른 서비스와 겹치지 않는 비밀번호를 권장합니다.
              </Description>
              <FieldError>비밀번호는 8자 이상 입력해 주세요.</FieldError>
            </TextField>

            <TextField name="passwordConfirm" type="password" isRequired className="w-full max-w-2xl" variant="default">
              <Label className="text-base">비밀번호 확인</Label>
              <Input
                className="ring-1 ring-neutral-200 focus:ring-2 focus:ring-accent"
                value={passwordConfirm}
                onChange={(e) => {
                  setPasswordConfirm(e.currentTarget.value);
                  setErrors((previous) => ({ ...previous, passwordConfirm: null }));
                }}
                placeholder="비밀번호를 한 번 더 입력해주세요."
              />
              <Description className="text-sm">위에 입력한 비밀번호와 동일하게 입력해 주세요.</Description>
              <FieldError>비밀번호 확인은 필수 입력값입니다.</FieldError>
            </TextField>

            <div className="flex w-full max-w-2xl flex-col gap-4 sm:flex-row">
              <TextField
                className="w-full sm:w-60"
                name="username"
                type="text"
                isRequired
                value={username}
                onChange={setUsername}
                pattern={USERNAME_PATTERN.source}
                variant="default"
              >
                <Label className="text-base">이름</Label>
                <Input className="ring-1 ring-neutral-200 focus:ring-2 focus:ring-accent" placeholder="홍길동" />
                <Description className="text-sm">영문, 한글과 띄어쓰기만 사용할 수 있습니다.</Description>
                <FieldError>이름은 필수이며 영문, 한글과 띄어쓰기만 사용할 수 있습니다.</FieldError>
              </TextField>

              <TextField className="w-full flex-1" name="email" type="email" isRequired variant="default">
                <Label className="text-base">이메일</Label>
                <Input
                  className="ring-1 ring-neutral-200 focus:ring-2 focus:ring-accent"
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  placeholder="name@example.com"
                />
                <Description className="text-sm">알림 및 주요 안내를 받을 이메일 주소를 입력해 주세요.</Description>
                <FieldError>이메일은 필수 입력값입니다.</FieldError>
              </TextField>
            </div>

            <Separator />
            <Button className="h-12" type="submit" fullWidth isPending={isSubmitting}>
              <span className="text-medium">가입 신청하기</span>
            </Button>
          </Form>
        </Card.Content>
      </Card>
    </main>
  );
}
