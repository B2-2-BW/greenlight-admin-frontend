import { useEffect } from 'react';
import SiteSettingsForm from '../component/setting/SiteSettingsForm.jsx';

export default function SiteSettingsPage() {
  useEffect(() => {
    document.title = '설정 | Greenlight Admin';
  }, []);
  return (
    <>
      <div className="w-full bg-neutral-50">
        <div className="max-w-[1080px] p-4 sm:p-6">
          <div className="mb-4 mt-4 text-2xl font-bold sm:mt-8 sm:text-3xl">시스템 설정</div>
          <SiteSettingsForm />
        </div>
      </div>
    </>
  );
}
