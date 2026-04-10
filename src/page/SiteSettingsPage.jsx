import { useEffect } from 'react';
import SiteSettingsForm from '../component/setting/SiteSettingsForm.jsx';

export default function SiteSettingsPage() {
  useEffect(() => {
    document.title = '설정 | Greenlight Admin';
  }, []);
  return (
    <>
      <div className="w-full bg-neutral-50">
        <div className="p-4 max-w-[1080px]">
          <div className="font-bold text-3xl mt-8 mb-4">시스템 설정</div>
          <SiteSettingsForm />
        </div>
      </div>
    </>
  );
}
