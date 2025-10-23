import { useEffect } from 'react';
import SystemSettingsForm from '../component/setting/SystemSettingsForm.jsx';

export default function SystemSettingsPage() {
  useEffect(() => {
    document.title = '설정 | Greenlight Admin';
  }, []);
  return (
    <>
      <div className="p-4 max-w-[1080px]">
        <div className="font-bold text-3xl mt-8 mb-4">시스템 설정</div>
        <SystemSettingsForm />
      </div>
    </>
  );
}
