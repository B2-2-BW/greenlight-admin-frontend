import { addToast, Button, DateRangePicker, Form, Input, NumberInput, Skeleton, useDisclosure } from '@heroui/react';
import EventDetailSectionTitle from './EventDetailSectionTitle.jsx';
import { useCallback, useEffect, useState } from 'react';
import { parseDateTime } from '@internationalized/date';
import { useLocation, useNavigate, useParams } from 'react-router';
import EventStatusChip from './EventStatusChip.jsx';
import ArrowBackSvg from '../icon/ArrowBackSvg.jsx';
import {
  invalidateCoreEventCache,
  deleteEventByEventName,
  getEventByEventName,
  updateEventByEventName,
} from '../api/event/index.js';
import DeleteSvg from '../icon/Delete.jsx';
import ConfirmModal from './ConfirmModal.jsx';

export default function EventDetailForm({ onPressBack }) {
  const location = useLocation();
  const { eventName } = useParams();

  const [isEventLoading, setIsEventLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const [event, setEvent] = useState(null);
  const [editEventName, setEditEventName] = useState('');
  const [editEventDescription, setEditEventDescription] = useState('');
  const [editEventType, setEditEventType] = useState('');
  const [editEventUrl, setEditEventUrl] = useState('');
  const [editQueueBackpressure, setEditQueueBackpressure] = useState(0);

  const [editEventRange, setEditEventRange] = useState(null);

  const navigate = useNavigate();

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const clearForm = () => {
    setEditEventName('');
    setEditEventDescription('');
    setEditEventType('');
    setEditEventUrl('');
    setEditQueueBackpressure(0);
    setEditEventRange(null);
  };

  const handleQueueBackpressureChange = (val) => {
    console.log(val);
    setEditQueueBackpressure(val);
  };

  const fetchEvent = async () => {
    setIsEventLoading(true);
    clearForm();

    try {
      const data = await getEventByEventName(eventName);
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
  // Location 이동 시 실행
  useEffect(() => {
    fetchEvent(eventName);
  }, [eventName]);

  const applySeoulOffset = (date) => {
    const offset = new Date().getTimezoneOffset() * 60000;
    date.setSeconds(0);
    date.setMilliseconds(0);
    return new Date(date - offset);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitLoading(true);

    console.log(editEventRange.start);
    console.log(typeof editEventRange.start);
    const startDate = applySeoulOffset(editEventRange.start.toDate()); // toISOString은 9시간 시차가 발생하여 수동으로 맞춰줌.
    const endDate = applySeoulOffset(editEventRange.end.toDate());

    const updatedData = {
      eventDescription: editEventDescription,
      eventType: editEventType,
      eventUrl: editEventUrl,
      queueBackpressure: editQueueBackpressure,
      eventStartTime: editEventRange?.start ? startDate.toISOString() : null,
      eventEndTime: editEventRange?.end ? endDate.toISOString() : null,
    };

    try {
      await updateEventByEventName(eventName, updatedData);
      await invalidateCoreEventCache(eventName);
      await fetchEvent(eventName);
      addToast({
        title: '이벤트 상세',
        description: '성공적으로 저장했습니다.',
        color: 'success',
      });
    } catch (error) {
      console.log(error);
      addToast({
        title: '이벤트 상세',
        description: '저장에 실패했습니다.',
        color: 'danger',
      });
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    setIsSubmitLoading(true);
    try {
      await deleteEventByEventName(eventName);
      await invalidateCoreEventCache(eventName);
      addToast({
        title: '이벤트 삭제',
        description: '이벤트가 성공적으로 삭제되었습니다.',
        color: 'success',
      });
      navigate('/events');
    } catch (error) {
      console.log('삭제 실패:', error);
      addToast({
        title: '이벤트 삭제',
        description: '삭제에 실패했습니다.',
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
              <div className="flex flex-row gap-4">
                <Button size="sm" className="p-1" isIconOnly variant="light" onPress={onOpen}>
                  <DeleteSvg />
                </Button>
                <Button size="sm" isIconOnly variant="light" onPress={onPressBack}>
                  <ArrowBackSvg />
                </Button>
              </div>
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
                placeholder="이벤트 ID를 입력하세요."
                name="eventName"
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
                placeholder="1초당 유입량"
                minValue={0}
                description={
                  <div className="flex flex-col">
                    <span>1초당 유입시킬 고객의 숫자입니다.</span> <span>0으로 설정하면 이동이 멈춥니다.</span>
                  </div>
                }
                value={editQueueBackpressure}
                // onChange={handleQueueBackpressureChange}
                onValueChange={handleQueueBackpressureChange}
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
        <div className="bottom-2 sticky mt-4 w-full bg-white rounded-xl z-20">
          <Button color="primary" type="submit" isLoading={isSubmitLoading} fullWidth>
            저장하기
          </Button>
        </div>
      </Form>

      <ConfirmModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title="이벤트 삭제"
        message="정말로 이 이벤트를 삭제하시겠습니까?"
        onConfirm={handleDeleteConfirmed}
        onCancel={onClose}
      />
    </>
  );
}
