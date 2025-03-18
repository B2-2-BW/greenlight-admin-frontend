import EventDetailForm from '../component/EventDetailForm.jsx';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';

export default function EventDetailPage() {
  const navigate = useNavigate();
  const onPressBack = () => {
    navigate('/events');
  };
  useEffect(() => {
    document.title = '이벤트 상세 | Greenlight Admin';
  }, []);
  return (
    <>
      <div className="p-4 max-w-[1080px] h-[100vh-64px]">
        <EventDetailForm onPressBack={onPressBack} />
      </div>
    </>
  );
}
