import { useEffect } from 'react';
import SchedulerList from '../component/scheduler/SchedulerList.jsx';
import OperationalDataSyncSection from '../component/scheduler/OperationalDataSyncSection.jsx';

export default function SchedulerPage() {
  useEffect(() => {
    document.title = '시스템 관리 | Greenlight Admin';
  }, []);

  return (
    <div className="max-w-[1080px] p-4 sm:p-6">
      <h1 className="mb-4 mt-4 text-2xl font-bold sm:mt-8 sm:text-3xl">시스템 관리</h1>
      <div className="flex flex-col gap-4">
        <OperationalDataSyncSection />
        <SchedulerList />
      </div>
    </div>
  );
}
