import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import RoomListTopContent from '../component/room/RoomListTopContent.jsx';
import RoomListTable from '../component/room/RoomListTable.jsx';

export default function RoomListPage() {
  const navigate = useNavigate();

  const onPress = (roomId) => {
    navigate(`/rooms/${roomId}`);
  };

  useEffect(() => {
    document.title = '대기열 목록 | Greenlight Admin';
  }, []);
  return (
    <>
      <div className="p-4 max-w-[1080px]">
        <div className="font-bold text-3xl mt-8 mb-4">대기열 목록</div>
        <RoomListTopContent /> {/* 이거는 기능 동작 필요 없어서 일단 무시 */}
        <RoomListTable onPress={onPress} />
      </div>
    </>
  );
}
