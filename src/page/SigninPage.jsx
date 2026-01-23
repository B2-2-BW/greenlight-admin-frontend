import { Button, Card, CardBody, CardFooter, CardHeader, Form, Input, Switch } from '@heroui/react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';

const commonInputProps = {
  labelPlacement: 'outside-left',
  errorMessage: '해당 항목은 필수 입력값입니다.',
  radius: 'sm',
  fullWidth: true,
};

export default function SigninPage() {
  const navigate = useNavigate();
  const [siteId, setSiteId] = useState('');
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errors, setErrors] = useState({});

  const handleSignin = async (e) => {};

  const inputProps = [
    {
      name: 'userId',
      label: '사용자 ID (사번)',
      type: 'text',
      placeholder: 'ID를 입력해 주세요',
      isRequired: true,
      value: userId,
      setter: setUserId,
    },
    {
      name: 'password',
      label: '비밀번호',
      type: 'password',
      placeholder: '비밀번호를 입력해 주세요',
      isRequired: true,
      value: password,
      setter: setPassword,
    },
    {
      name: 'passwordConfirm',
      label: '비밀번호 확인',
      type: 'password',
      placeholder: '비밀번호 확인을 입력해 주세요',
      isRequired: true,
      value: passwordConfirm,
      setter: setPasswordConfirm,
    },
    {
      name: 'username',
      label: '이름',
      type: 'text',
      placeholder: '이름을 입력해 주세요',
      isRequired: true,
      value: username,
      setter: setUsername,
    },
    {
      name: 'email',
      label: '이메일',
      type: 'email',
      placeholder: 'greenlight@thehyundai.com',
      isRequired: true,
      value: email,
      setter: setEmail,
      description: '비밀번호 찾기 시 활용됩니다. 정확하게 입력해 주세요.',
    },
    {
      name: 'phoneNumber',
      label: '전화번호',
      type: 'tel',
      placeholder: '- 없이 입력해 주세요',
      isRequired: false,
      value: phoneNumber,
      setter: setPhoneNumber,
    },
  ];

  useEffect(() => {
    document.title = '회원가입 | Greenlight Admin';
  }, []);
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Card className="px-8 py-8">
        <CardHeader className="flex flex-col items-start">
          <span className="text-3xl font-bold mt-8 mb-4">회원가입</span>
        </CardHeader>
        <CardBody className="w-[600px]">
          <Form onSubmit={handleSignin} validationErrors={errors} className="flex gap-6">
            <div className="flex w-full">
              <Input
                name="siteId"
                label="소속코드"
                type="text"
                placeholder="A001"
                isRequired
                value={siteId}
                onChange={(e) => setSiteId(e.target.value)}
                {...commonInputProps}
              />
              <Button>검증하기</Button>
            </div>
            {inputProps.map((item, index) => (
              <Input
                name={item.name}
                label={item.label}
                type={item.type}
                placeholder={item.placeholder}
                isRequired={item.isRequired}
                description={item.description}
                value={item.value}
                onChange={(e) => item.setter(e.target.value)}
                fullWidth
                {...commonInputProps}
              />
            ))}
            <Button className="h-12" color="primary" type="submit" fullWidth isLoading={false}>
              <span className="text-medium">가입 신청하기</span>
            </Button>
          </Form>
        </CardBody>

        <CardFooter></CardFooter>
      </Card>
    </div>
  );
}
