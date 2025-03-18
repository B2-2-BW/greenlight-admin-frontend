import EventDetailForm from '../component/EventDetailForm.jsx';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import EventListTopContent from '../component/EventListTopContent.jsx';
import EventListTable from '../component/EventListTable.jsx';
import EventCreateForm from '../component/EventCreateForm.jsx';

export default function EventCreatePage() {
  const navigate = useNavigate();

  const onPressBack = () => {
    navigate('/events');
  };
  useEffect(() => {
    document.title = '이벤트 생성 | Greenlight Admin';
  }, []);

  return (
      <>
        <div className="p-4 max-w-[1080px]">
            <div className="font-bold text-3xl mt-8 mb-4">이벤트 신규 생성</div>
            <EventCreateForm onPressBack={onPressBack}/>   
        </div>
      </>
    );
}
