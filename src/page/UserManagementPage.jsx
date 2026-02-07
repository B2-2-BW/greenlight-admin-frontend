import UserListTable from '../component/user/UserListTable.jsx';

export default function UserManagementPage() {
  return (
    <div className="p-4 max-w-[1080px]">
      <div className="font-bold text-3xl mt-8 mb-4">사용자 관리</div>
      <UserListTable />
    </div>
  );
}
