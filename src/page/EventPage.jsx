import EventListTable from '../component/EventListTable.jsx';
import { useNavigate } from 'react-router';
import EventListTopContent from '../component/EventListTopContent.jsx';
import { useEffect } from 'react';

export default function EventPage() {
  const navigate = useNavigate();

  const onPress = (eventName) => {
    navigate(`/events/${eventName}`);
  };

  useEffect(() => {
    document.title = '이벤트 목록 | Greenlight Admin';
  }, []);
  return (
    <>
      <div className="p-4 max-w-[1080px]">
        <div className="font-bold text-3xl mt-8 mb-4">이벤트 목록</div>
        <EventListTopContent /> {/* 이거는 기능 동작 필요 없어서 일단 무시 */}
        <EventListTable onPress={onPress} />
      </div>
    </>
  );
}
