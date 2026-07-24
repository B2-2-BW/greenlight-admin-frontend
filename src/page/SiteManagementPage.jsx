import SiteListTable from '../component/site/SiteListTable.jsx';

export default function SiteManagementPage() {
  return (
    <div className="p-4 max-w-[1080px]">
      <h1 className="mt-8 mb-1 text-3xl font-bold">사이트 관리</h1>
      <p className="mb-6 text-sm text-muted">사이트 정보와 운영 상태를 관리합니다.</p>
      <SiteListTable />
    </div>
  );
}
