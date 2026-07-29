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
    <div className="min-h-[calc(100dvh-64px)] w-full bg-neutral-50">
      <div className="w-full max-w-[1080px] p-3 pb-0 sm:p-6 sm:pb-6">
        <RoomDetailForm onPressBack={onPressBack} />
      </div>
    </div>
  );
}
