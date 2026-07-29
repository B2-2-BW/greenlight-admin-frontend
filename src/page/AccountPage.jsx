import { useEffect } from 'react';
import MyPageForm from '../component/mypage/MyPageForm.jsx';

export default function AccountPage() {
  useEffect(() => {
    document.title = '내 계정 | Greenlight Admin';
  }, []);

  return (
    <div className="w-full bg-neutral-50">
      <div className="max-w-[1080px] p-4 sm:p-6">
        <header className="mb-4 mt-4 flex items-center justify-between gap-4 sm:mt-8">
          <h1 className="text-2xl font-bold sm:text-3xl">내 계정</h1>
        </header>
        <MyPageForm />
      </div>
    </div>
  );
}
