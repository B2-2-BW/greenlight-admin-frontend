import SchedulerList from '../component/scheduler/SchedulerList.jsx';

export default function SchedulerPage() {
  return (
    <div className="p-4 max-w-[1080px]">
      <div className="font-bold text-3xl mt-8 mb-4">스케쥴러 목록</div>
      <SchedulerList />
    </div>
  );
}
