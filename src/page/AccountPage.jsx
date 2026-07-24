import { useEffect } from 'react';
import MyPageForm from '../component/mypage/MyPageForm.jsx';

export default function AccountPage() {
  useEffect(() => {
    document.title = '내 계정 | Greenlight Admin';
  }, []);

  return (
    <div className="w-full bg-neutral-50">
      <div className="p-4 max-w-[1080px]">
        <header className="mt-8 mb-4 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">내 계정</h1>
        </header>
        <MyPageForm />
      </div>
    </div>
  );
}
