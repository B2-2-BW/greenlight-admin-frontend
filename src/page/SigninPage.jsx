import { Button, Card, CardBody, CardFooter, CardHeader, Divider, Form, Input } from '@heroui/react';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import logo from '/logo.png';
import { SiteClient } from '../api/site/index.js';

const commonInputProps = {
  radius: 'sm',
  fullWidth: true,
  errorMessage: ({ validationDetails, validationErrors }) => {
    if (validationDetails.valueMissing) {
      return '해당 항목은 필수 입력값입니다.';
    } else {
      return validationErrors;
    }
  },
};

export default function SigninPage() {
  const navigate = useNavigate();
  const [siteId, setSiteId] = useState('');
  const [verifiedSiteId, setVerifiedSiteId] = useState('');
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errors, setErrors] = useState({});

  const [isSiteVerificationLoading, setIsSiteVerificationLoading] = useState(false);

  const handleSignin = async (e) => {};

  const handleSiteIdVerification = async () => {
    setIsSiteVerificationLoading(true);

    SiteClient.findSite(siteId.trim())
      .then((response) => {
        if (response?.status === 200 && response?.data?.siteId === siteId) {
          setVerifiedSiteId(siteId);
          setErrors({ siteId: null });
        } else {
          setVerifiedSiteId('');
          setErrors({ siteId: '유효하지 않은 소속코드입니다.' });
          if (response?.status !== 404) {
            // 404인 경우 딱히 검증할 필요가 없음
            console.log(JSON.stringify(response));
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
    <div className="flex flex-col items-center justify-center h-screen">
      <Card className="px-8 py-8">
        <CardHeader className="flex flex-col items-start">
          <img className="w-28" src={logo} alt="GreenLight Logo" />
          <span className="text-3xl font-bold mt-8 mb-4">회원가입</span>
        </CardHeader>
        <CardBody className="w-[600px]">
          <Form onSubmit={handleSignin} validationErrors={errors} className="flex gap-4">
            <div className="flex w-full items-baseline gap-2">
              <Input
                name="siteId"
                label="소속코드"
                type="text"
                isRequired
                value={siteId}
                onChange={onSiteIdInputChange}
                {...commonInputProps}
              />
              <Button
                isLoading={isSiteVerificationLoading}
                onPress={handleSiteIdVerification}
                isDisabled={siteId.trim().length === 0 || verifiedSiteId.trim().length > 0}
              >
                {isSiteVerificationLoading ? '' : siteId === verifiedSiteId ? '검증완료' : '검증하기'}
              </Button>
            </div>
            <Input
              {...commonInputProps}
              name="userId"
              label="아이디 (사번)"
              type="text"
              isRequired
              value={userId}
              onChange={(e) => setUserId(e.currentTarget.value)}
            />

            <Input
              {...commonInputProps}
              name="password"
              label="비밀번호"
              type="password"
              isRequired
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
            />

            <Input
              {...commonInputProps}
              name="passwordConfirm"
              label="비밀번호 확인"
              type="password"
              isRequired
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.currentTarget.value)}
            />

            <div className="flex gap-2 w-full">
              <Input
                className="w-60"
                {...commonInputProps}
                name="username"
                label="이름"
                type="text"
                isRequired
                value={username}
                onChange={(e) => setUsername(e.currentTarget.value)}
              />

              <Input
                {...commonInputProps}
                name="email"
                label="이메일"
                type="email"
                isRequired
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
              />
            </div>
            <Input
              {...commonInputProps}
              name="phoneNumber"
              label="전화번호"
              type="tel"
              description="- 없이 입력해 주세요"
              isRequired={false}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.currentTarget.value)}
            />

            <Divider />
            <Button className="h-12" color="primary" type="submit" fullWidth isLoading={false}>
              <span className="text-medium">가입 신청하기</span>
            </Button>
          </Form>
        </CardBody>
      </Card>
    </div>
  );
}
