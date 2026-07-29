import UserListTable from '../component/user/UserListTable.jsx';

export default function UserManagementPage() {
  return (
    <div className="max-w-[1080px] p-4 sm:p-6">
      <div className="mb-1 mt-4 text-2xl font-bold sm:mt-8 sm:text-3xl">사용자 관리</div>
      <p className="mb-6 text-sm text-muted">가입 신청을 승인하고 사이트 구성원의 계정 상태를 관리합니다.</p>
      <UserListTable />
    </div>
  );
}
