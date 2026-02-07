import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import RoomDetailForm from '../component/room/RoomDetailForm.jsx';

export default function RoomDetailPage() {
  const navigate = useNavigate();
  const onPressBack = () => {
    navigate('/rooms');
  };
  useEffect(() => {
    document.title = '대기열 상세 | Greenlight Admin';
  }, []);
  return (
    <>
      <div className="p-4 max-w-[1080px] h-[100vh-64px]">
        <RoomDetailForm onPressBack={onPressBack} />
      </div>
    </>
  );
}
