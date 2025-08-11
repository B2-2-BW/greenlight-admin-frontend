import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import ActionGroupTopContent from '../component/action-group/ActionGroupTopContent.jsx';
import ActionGroupListTable from '../component/action-group/ActionGroupListTable.jsx';

export default function ActionGroupPage() {
  const navigate = useNavigate();

  const onPress = (actionGroupId) => {
    navigate(`/action-groups/${actionGroupId}`);
  };

  useEffect(() => {
    document.title = '액션 그룹 목록 | Greenlight Admin';
  }, []);
  return (
    <>
      <div className="p-4 max-w-[1080px]">
        <div className="font-bold text-3xl mt-8 mb-4">액션 그룹 목록</div>
        <ActionGroupTopContent /> {/* 이거는 기능 동작 필요 없어서 일단 무시 */}
        <ActionGroupListTable onPress={onPress} />
      </div>
    </>
  );
}
