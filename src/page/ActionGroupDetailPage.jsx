import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import ActionGroupDetailForm from '../component/action-group/ActionGroupDetailForm.jsx';

export default function ActionGroupDetailPage() {
  const navigate = useNavigate();
  const onPressBack = () => {
    navigate('/action-groups');
  };
  useEffect(() => {
    document.title = '액션 그룹 상세 | Greenlight Admin';
  }, []);
  return (
    <>
      <div className="p-4 max-w-[1080px] h-[100vh-64px]">
        <ActionGroupDetailForm onPressBack={onPressBack} />
      </div>
    </>
  );
}
