import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { addToast, Button, Input } from '@heroui/react';
import logo from '../icon/logo.png';

export default function LoginPage() {
  const navigate = useNavigate();
  
  const [editUserName, setEditUserName] = useState('');
  const [editPassword, setEditPassword] = useState('');
  
  const [isLogin, setIsLogin] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = () => {
    if (editUserName === 'admin' && editPassword === 'admin') {
      setIsLogin(true);
    } else {
        addToast({
            title: '로그인 실패',
            description: '아이디 또는 비밀번호가 잘못되었습니다',
            color: 'danger',
          });
    }
  };

  useEffect(() => {
    if (isLogin) {
      navigate('/events');
    }
  }, [isLogin, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col w-full max-w-[1080px] p-6 bg-white rounded-lg items-center justify-center">
        <img src={logo} alt="GreenLight 로고" className="w-full h-auto" />
        
        <div className="w-90 flex flex-col items-center justify-center">
          <Input
            className="w-80 p-2 mb-4"
            isRequired
            errorMessage="사용자 ID는 필수값입니다."
            label="사용자 ID"
            labelPlacement="outside"
            name="userName"
            type="text"
            value={editUserName}
            onChange={(e) => setEditUserName(e.target.value)}
          />
          
          <Input
            className="w-80 mb-12 !mt-4 p-2"
            isRequired
            errorMessage="사용자 비밀번호는 필수값입니다."
            label="비밀번호"
            labelPlacement="outside"
            name="password"
            type="password"
            value={editPassword}
            onChange={(e) => setEditPassword(e.target.value)}
          />
          
          {errorMessage && <div className="text-red-500 mb-4">{errorMessage}</div>}

          <Button
            color="primary"
            type="button"
            fullWidth
            onClick={handleLogin}
            isLoading={false}
          >
            로그인
          </Button>
        </div>
      </div>
    </div>
  );
}
