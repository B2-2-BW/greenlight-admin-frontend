import UserListTable from '../component/user/UserListTable.jsx';

export default function UserManagementPage() {
  return (
    <div className="p-4 max-w-[1080px]">
      <div className="mt-8 mb-1 text-3xl font-bold">사용자 관리</div>
      <p className="mb-6 text-sm text-muted">가입 신청을 승인하고 사이트 구성원의 계정 상태를 관리합니다.</p>
      <UserListTable />
    </div>
  );
}
