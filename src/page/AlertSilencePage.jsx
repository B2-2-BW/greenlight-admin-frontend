import { useEffect } from 'react';
import AlertSilenceTable from '../component/alert/AlertSilenceTable.jsx';

export default function AlertSilencePage() {
  useEffect(() => {
    document.title = '플랜다운 | Greenlight Admin';
  }, []);

  return (
    <div className="max-w-[1080px] p-4 sm:p-6">
      <h1 className="mb-6 mt-4 text-2xl font-bold sm:mt-8 sm:text-3xl">플랜다운</h1>
      <AlertSilenceTable />
    </div>
  );
}
