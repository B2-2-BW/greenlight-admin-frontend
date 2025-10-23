import GrafanaDashboard from '../component/GrafanaDashboard.jsx';
import { useEffect } from 'react';
import Dashboard from '../component/dashboard/Dashboard.jsx';

export default function DashboardPage() {
  useEffect(() => {
    document.title = '대시보드 | Greenlight Admin';
  }, []);
  return (
    <>
      <div className="p-4 w-full">
        <div className="font-bold text-3xl mt-8 mb-4">대시보드</div>
        {/*<GrafanaDashboard />*/}
        <Dashboard />
      </div>
    </>
  );
}
