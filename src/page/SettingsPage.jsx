import { useEffect } from 'react';
import SettingsForm from '../component/setting/SettingsForm.jsx';

export default function SettingsPage() {
  useEffect(() => {
    document.title = '설정 | Greenlight Admin';
  }, []);
  return (
    <>
      <div className="p-4 max-w-[1080px]">
        <div className="font-bold text-3xl mt-8 mb-4">설정</div>
        <SettingsForm /> {/* 이거는 기능 동작 필요 없어서 일단 무시 */}
      </div>
    </>
  );
}
