import { addToast, Button, DateRangePicker, Form, Input, NumberInput, Skeleton } from '@heroui/react';
import EventDetailSectionTitle from './EventDetailSectionTitle.jsx';
import { useEffect, useState } from 'react';
import { parseDateTime } from '@internationalized/date';
import { useLocation, useNavigate } from 'react-router';
import EventStatusChip from './EventStatusChip.jsx';
import ArrowBackSvg from '../icon/ArrowBackSvg.jsx';
import { CoreCacheReload, getEventInfo, updateEventInfo } from '../api/event/index.js';

export default function EventDetailForm({ onPressBack }) {
  const location = useLocation();
  const [isEventLoading, setIsEventLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const [event, setEvent] = useState(null);

  const [editEventName, setEditEventName] = useState('');
  const [editEventDescription, setEditEventDescription] = useState('');
  const [editEventType, setEditEventType] = useState('');
  const [editEventUrl, setEditEventUrl] = useState('');
  const [editQueueBackpressure, setEditQueueBackpressure] = useState(0);
  const [editEventRange, setEditEventRange] = useState(null);

  const eventName = location.pathname.split('/').pop();
  const navigate = useNavigate();

  const clearForm = () => {
    setEditEventName('');
    setEditEventDescription('');
    setEditEventType('');
    setEditEventUrl('');
    setEditQueueBackpressure(0);
    setEditEventRange(null);
  };

  // Location 이동 시 실행
  useEffect(() => {
    const fetchEvent = async () => {
      setIsEventLoading(true);
      clearForm();
  
      try {
        const data = await getEventInfo(eventName);
        setEvent(data);
  
        setEditEventName(data.eventName || '');
        setEditEventDescription(data.eventDescription || '');
        setEditEventType(data.eventType || '');
        setEditEventUrl(data.eventUrl || '');
        setEditQueueBackpressure(data.queueBackpressure ?? 0);
        setEditEventRange({
          start: parseDateTime(data.eventStartTime),
          end: parseDateTime(data.eventEndTime),
        });
  
      } catch (error) {
        console.error('Error fetching event:', error);

        if (error.status === 404) {
          navigate('/404');
        }
      } finally {
        setIsEventLoading(false);
      }
    };
  
    fetchEvent();
  }, [location]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitLoading(true);
    
    const updatedData = {
      eventDescription: editEventDescription,
      eventType: editEventType,
      eventUrl: editEventUrl,
      queueBackpressure: editQueueBackpressure,
      eventStartTime: editEventRange?.start ? new Date(editEventRange.start).toISOString() : null,
      eventEndTime: editEventRange?.end ? new Date(editEventRange.end).toISOString() : null,
    };

    console.log(updatedData);
    
    
    try {
      await updateEventInfo(eventName, updatedData);
      await CoreCacheReload(eventName);
      addToast({
        title: '이벤트 상세',
        description: '성공적으로 저장했습니다.',
        color: 'success',
      });
    } catch (error) {
      console.log(error)
      addToast({
        title: '이벤트 상세',
        description: '저장에 실패했습니다.',
        color: 'danger',
      });
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const renderEventStatusChip = (start, end) => {
    if (start == null || end == null) return;
    let now = new Date();
    let startDate = new Date(start);
    let endDate = new Date(end);
    if (now < startDate) {
      return <EventStatusChip status="upcoming" />;
    } else if (now > endDate) {
      return <EventStatusChip status="closed" />;
    }
    return <EventStatusChip status="open" />;
  };

  return (
    <>
      <Form
        className="w-full flex flex-col"
        // onReset={() => setAction('reset')}
        onSubmit={onSubmit}
      >
        <div className="relative w-full flex flex-col gap-4">
          <div className="w-full">
            <div className="flex justify-between items-center">
              <div className="text-sm text-default-400 mb-1">이벤트 상세</div>
              <Button size="sm" isIconOnly variant="light" onPress={onPressBack}>
                <ArrowBackSvg />
              </Button>
            </div>
            <Skeleton className="rounded-lg w-full h-10" isLoaded={!isEventLoading}>
              <div className="flex items-baseline gap-2">
                <div className="font-bold text-3xl">{event?.eventDescription}</div>
                {renderEventStatusChip(event?.eventStartTime, event?.eventEndTime)}
              </div>
            </Skeleton>
          </div>
          <EventDetailSectionTitle title="기본 설정" />
          <Skeleton className="rounded-lg w-full" isLoaded={!isEventLoading}>
            <div className="flex w-full gap-4">
              <Input
                className="w-80"
                isRequired
                errorMessage="이벤트 ID는 필수값입니다."
                label="이벤트 ID"
                labelPlacement="outside"
                name="eventName"
                placeholder="이벤트 ID를 입력하세요."
                description="이벤트의 고유한 ID 입니다."
                type="text"
                value={editEventName}
                onChange={(e) => setEditEventName(e.target.value)}
              />
              <Input
                className="grow"
                isRequired
                errorMessage="이벤트 설명은 필수값입니다."
                label="이벤트 설명"
                labelPlacement="outside"
                name="eventDescription"
                placeholder="어떤 이벤트인지 알려주세요."
                type="text"
                description="고객이 보게 될 이벤트 설명입니다."
                value={editEventDescription}
                onChange={(e) => setEditEventDescription(e.target.value)}
              />
            </div>
          </Skeleton>
          {/*<Skeleton className="rounded-lg w-full" isLoaded={!isEventLoading}></Skeleton>*/}
          <EventDetailSectionTitle title="흐름 제어" />
          <Skeleton className="rounded-lg w-full" isLoaded={!isEventLoading}>
            <div className="flex w-full gap-4">
              <NumberInput
                isRequired
                className="w-60"
                errorMessage="유입량은 필수값입니다."
                label="유입량(초)"
                labelPlacement="outside"
                name="queueBackpressure"
                description="1초당 유입량을 입력해주세요."
                defaultValue={10}
                minValue={0}
                value={editQueueBackpressure}
                onChange={setEditQueueBackpressure}
              />
              <DateRangePicker
                isRequired
                hideTimeZone
                granularity="minute"
                label="입장 가능 기간"
                labelPlacement="outside"
                visibleMonths={2}
                description="대기열에 입장할 수 있는 시작시간과 종료시간을 입력해주세요."
                hourCycle={24}
                value={editEventRange}
                onChange={setEditEventRange}
              />
            </div>
          </Skeleton>
          <Skeleton className="rounded-lg" isLoaded={!isEventLoading}>
            <Input
              isRequired
              label="이동 URL"
              labelPlacement="outside"
              name="eventUrl"
              placeholder="https://www.example.com"
              type="url"
              description="대기가 끝난 고객이 이동하게 될 URL을 입력해 주세요."
              value={editEventUrl}
              onChange={(e) => setEditEventUrl(e.target.value)}
            />
          </Skeleton>
        </div>
        <div className="bottom-2 sticky mt-4 w-full bg-white rounded-xl">
          <Button color="primary" type="submit" isLoading={isSubmitLoading} fullWidth>
            저장하기
          </Button>
        </div>
      </Form>
    </>
  );
}
