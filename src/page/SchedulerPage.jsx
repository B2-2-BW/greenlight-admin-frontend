import SchedulerList from '../component/scheduler/SchedulerList.jsx';

export default function SchedulerPage() {
  return (
    <div className="max-w-[1080px] p-4 sm:p-6">
      <div className="mb-4 mt-4 text-2xl font-bold sm:mt-8 sm:text-3xl">시스템 상태</div>
      <SchedulerList />
    </div>
  );
}
