import EventDetailForm from '../component/EventDetailForm.jsx';
import { Card } from '@heroui/react';
import { useNavigate } from 'react-router';

export default function EventDetailPage() {
  const navigate = useNavigate();
  const onPressBack = () => {
    navigate(-1);
  };
  return (
    <>
      <div className="p-4 max-w-[720px] h-[100vh-64px]">
        <EventDetailForm onPressBack={onPressBack} />
      </div>
    </>
  );
}
