import SiteListTable from '../component/site/SiteListTable.jsx';

export default function SiteManagementPage() {
  return (
    <div className="max-w-[1080px] p-4 sm:p-6">
      <h1 className="mb-1 mt-4 text-2xl font-bold sm:mt-8 sm:text-3xl">사이트 관리</h1>
      <p className="mb-6 text-sm text-muted">사이트 정보와 운영 상태를 관리합니다.</p>
      <SiteListTable />
    </div>
  );
}
