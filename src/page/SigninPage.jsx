import { Button, Card, Separator, Form, Input, TextField, Label, FieldError, Description } from '@heroui/react';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import logo from '/logo.png';
import { SiteClient } from '../api/site/index.js';
import { UserClient } from '../api/user/index.js';
import { ToastUtil } from '../util/toastUtil.js';

export default function SigninPage() {
  const navigate = useNavigate();
  const [siteId, setSiteId] = useState('');
  const [verifiedSiteId, setVerifiedSiteId] = useState('');
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});

  const [isSiteVerificationLoading, setIsSiteVerificationLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignin = async (e) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    const validationErrors = {};
    if (verifiedSiteId !== siteId.trim()) validationErrors.siteId = true;
    if (!userId.trim()) validationErrors.userId = true;
    if (!password || password.length < 8) validationErrors.password = true;
    if (password !== passwordConfirm) validationErrors.passwordConfirm = true;
    if (!username.trim()) validationErrors.username = true;
    if (!email.trim()) validationErrors.email = true;

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      if (validationErrors.siteId) {
        ToastUtil.error('소속코드 확인 필요', '소속코드를 입력한 뒤 검증을 완료해 주세요.');
      } else if (validationErrors.passwordConfirm) {
        ToastUtil.error('비밀번호 확인', '비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      }
      return;
    }

    setIsSubmitting(true);
    const response = await UserClient.signin({
      siteId: verifiedSiteId,
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

  const handleSiteIdVerification = async () => {
    setIsSiteVerificationLoading(true);

    const normalizedSiteId = siteId.trim();
    SiteClient.findSite(normalizedSiteId)
      .then((response) => {
        if (
          response?.status === 200 &&
          response?.data?.siteId === normalizedSiteId &&
          response?.data?.siteEnabled === true
        ) {
          setVerifiedSiteId(normalizedSiteId);
          setErrors((previous) => ({ ...previous, siteId: null }));
        } else {
          setVerifiedSiteId('');
          setErrors((previous) => ({ ...previous, siteId: true }));
          if (response?.status !== 200 && response?.status !== 404) {
            ToastUtil.error('사이트 검증 실패', '사이트 검증에 실패하였습니다. 관리자에게 문의해주시기 바랍니다.');
            console.error('failed to verify siteId', JSON.stringify(response));
          }
        }
      })
      .finally(() => setIsSiteVerificationLoading(false));
  };

  const onSiteIdInputChange = (e) => {
    if (verifiedSiteId.trim().length > 0) {
      // siteId가 바뀌면 verified는 무조건 초기화
      setVerifiedSiteId('');
    }
    setSiteId(e.target.value);
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
            className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            aria-label="홈으로 이동"
            onClick={() => navigate('/')}
          >
            <img className="w-28" src={logo} alt="GreenLight Logo" />
          </button>
          <h1 className="mb-4 mt-8 text-2xl font-bold sm:text-3xl">회원가입</h1>
        </Card.Header>
        <Card.Content className="w-full min-w-0">
          <Form onSubmit={handleSignin} validationErrors={errors} className="flex flex-col gap-4">
            <TextField name="siteId" type="text" isRequired className="w-full max-w-2xl" variant="default">
              <Label className="text-base">소속코드</Label>
              <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  className="min-w-0 flex-1 ring-1 ring-neutral-200 focus:ring-2 focus:ring-accent"
                  value={siteId}
                  onChange={onSiteIdInputChange}
                  placeholder="발급받은 소속코드를 입력하세요."
                />
                <Button
                  className="w-full shrink-0 focus-visible:ring-2 focus-visible:ring-accent sm:w-auto"
                  isPending={isSiteVerificationLoading}
                  onPress={handleSiteIdVerification}
                  isDisabled={siteId.trim().length === 0 || verifiedSiteId.trim().length > 0}
                >
                  {isSiteVerificationLoading ? '' : siteId === verifiedSiteId ? '검증완료' : '검증하기'}
                </Button>
              </div>
              <Description className="text-sm">관리자에게 발급받은 소속코드를 확인해 주세요.</Description>
              <FieldError>유효하지 않거나 사용할 수 없는 소속코드입니다.</FieldError>
            </TextField>

            <TextField name="userId" type="text" isRequired className="w-full max-w-2xl" variant="default">
              <Label className="text-base">아이디</Label>
              <Input
                className="ring-1 ring-neutral-200 focus:ring-2 focus:ring-accent"
                value={userId}
                onChange={(e) => setUserId(e.currentTarget.value)}
                placeholder="로그인에 사용할 아이디를 입력하세요."
              />
              <Description className="text-sm">관리자 승인 후 로그인할 때 사용합니다.</Description>
              <FieldError>아이디는 필수 입력값입니다.</FieldError>
            </TextField>

            <TextField name="password" type="password" isRequired className="w-full max-w-2xl" variant="default">
              <Label className="text-base">비밀번호</Label>
              <Input
                className="ring-1 ring-neutral-200 focus:ring-2 focus:ring-accent"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                placeholder="안전한 비밀번호를 입력하세요."
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
                placeholder="비밀번호를 한 번 더 입력하세요."
              />
              <Description className="text-sm">위에 입력한 비밀번호와 동일하게 입력해 주세요.</Description>
              <FieldError>비밀번호 확인은 필수 입력값입니다.</FieldError>
            </TextField>

            <div className="flex w-full max-w-2xl flex-col gap-4 sm:flex-row">
              <TextField className="w-full sm:w-60" name="username" type="text" isRequired variant="default">
                <Label className="text-base">이름</Label>
                <Input
                  className="ring-1 ring-neutral-200 focus:ring-2 focus:ring-accent"
                  value={username}
                  onChange={(e) => setUsername(e.currentTarget.value)}
                  placeholder="실명을 입력하세요."
                />
                <Description className="text-sm">관리자가 가입 신청자를 확인하는 데 사용합니다.</Description>
                <FieldError>이름은 필수 입력값입니다.</FieldError>
              </TextField>

              <TextField className="w-full flex-1" name="email" type="email" isRequired variant="default">
                <Label className="text-base">이메일</Label>
                <Input
                  className="ring-1 ring-neutral-200 focus:ring-2 focus:ring-accent"
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  placeholder="name@example.com"
                />
                <Description className="text-sm">가입 관련 안내를 받을 이메일 주소입니다.</Description>
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
