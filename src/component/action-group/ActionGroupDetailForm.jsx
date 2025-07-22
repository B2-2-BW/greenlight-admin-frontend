import {
  addToast,
  Button,
  DateRangePicker,
  Form,
  Input,
  NumberInput,
  Skeleton,
  Switch,
  useDisclosure,
  cn,
  ScrollShadow,
} from '@heroui/react';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { getActionGroupById } from '../../api/action-group/index.js';
import DeleteSvg from '../../icon/Delete.jsx';
import ArrowBackSvg from '../../icon/ArrowBackSvg.jsx';
import SectionTitle from '../common/SectionTitle.jsx';
import ConfirmModal from '../ConfirmModal.jsx';
import ActionGroupStatusChip from './ActionGroupStatusChip.jsx';
import NotFoundPage from '../../page/NotFoundPage.jsx';
import SomethingWentWrongPage from '../../page/SomethingWentWrongPage.jsx';
import ActionListTable from '../action/ActionListTable.jsx';
import ActionEditModal from '../action/ActionEditModal.jsx';

export default function ActionGroupDetailForm({ onPressBack }) {
  const location = useLocation();
  const [errorStatus, setErrorStatus] = useState(null);
  const { actionGroupId } = useParams();

  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const [actionGroup, setActionGroup] = useState(null);
  const [actionId, setActionId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setDescription] = useState('');
  const [editEventType, setEditEventType] = useState('');
  const [editEventUrl, setEditEventUrl] = useState('');
  const [editMaxActiveCustomers, setEditMaxActiveCustomers] = useState(0);

  const [isEnabled, setIsEnabled] = useState(true);

  const navigate = useNavigate();

  const {
    isOpen: isOpenConfirm,
    onOpen: onOpenConfirm,
    onOpenChange: onOpenChangeConfirm,
    onClose: onCloseConfirm,
  } = useDisclosure();

  const {
    isOpen: isOpenAction,
    onOpen: onOpenAction,
    onOpenChange: onOpenChangeAction,
    onClose: onCloseAction,
  } = useDisclosure();

  const clearForm = () => {
    setEditName('');
    setDescription('');
    setEditEventType('');
    setEditEventUrl('');
    setEditMaxActiveCustomers(0);
    setIsEnabled(false);
  };

  const handleMaxActiveCustomersChange = (val) => {
    setEditMaxActiveCustomers(val);
  };

  const fetchActionGroup = async () => {
    setIsPageLoading(true);
    clearForm();

    try {
      const data = await getActionGroupById(actionGroupId);
      setActionGroup(data);

      setEditName(data.name || '');
      setDescription(data.description || '');
      setEditEventType(data.eventType || '');
      setEditEventUrl(data.eventUrl || '');
      setEditMaxActiveCustomers(data.maxActiveCustomers ?? 0);
      setIsEnabled(data?.enabled != null ? data.enabled : false);
    } catch (error) {
      console.error('Error fetching:', error);
      setErrorStatus(error.status);
    } finally {
      setIsPageLoading(false);
    }
  };
  // Location 이동 시 실행
  useEffect(() => {
    fetchActionGroup(actionGroupId);
  }, [actionGroupId]);

  const applySeoulOffset = (date) => {
    const offset = new Date().getTimezoneOffset() * 60000;
    date.setSeconds(0);
    date.setMilliseconds(0);
    return new Date(date - offset);
  };

  const enabledMessage = {
    true: {
      title: '대기열 활성화',
      subtitle: '대기열이 적용되어 활성사용자 수를 제어합니다.',
    },
    false: {
      title: '대기열 비활성화',
      subtitle: '대기열이 적용되지 않고, 즉시 진입이 가능한 상태가 됩니다',
    },
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitLoading(true);

    const startDate = applySeoulOffset(isEnabled.start.toDate()); // toISOString은 9시간 시차가 발생하여 수동으로 맞춰줌.
    const endDate = applySeoulOffset(isEnabled.end.toDate());

    const updatedData = {
      eventDescription: editDescription,
      eventType: editEventType,
      eventUrl: editEventUrl,
      queueBackpressure: editMaxActiveCustomers,
      eventStartTime: isEnabled?.start ? startDate.toISOString() : null,
      eventEndTime: isEnabled?.end ? endDate.toISOString() : null,
    };

    try {
      await updateEventByEventName(eventName, updatedData);
      await invalidateCoreEventCache(eventName);
      await fetchActionGroup(eventName);
      addToast({
        title: '이벤트 상세',
        description: '성공적으로 저장했습니다.',
        color: 'success',
      });
    } catch (error) {
      console.error(error);
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
      console.error('삭제 실패:', error);
      addToast({
        title: '이벤트 삭제',
        description: '삭제에 실패했습니다.',
        color: 'danger',
      });
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleActionSaveConfirmed = async () => {
    console.log('action saved!');
  };

  const onPressAction = (actionId) => {
    setActionId(actionId);
    onOpenAction();
  };

  if (errorStatus === 404) {
    return <NotFoundPage />;
  } else if (errorStatus === 500) {
    return <SomethingWentWrongPage />;
  }

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
              <div className="text-sm text-default-400 mb-1">{actionGroup?.name}</div>
              <div className="flex flex-row gap-4">
                <Button size="sm" className="p-1" isIconOnly variant="light" onPress={onOpenConfirm}>
                  <DeleteSvg />
                </Button>
                <Button size="sm" isIconOnly variant="light" onPress={onPressBack}>
                  <ArrowBackSvg />
                </Button>
              </div>
            </div>
            <Skeleton className="rounded-lg w-full h-10" isLoaded={!isPageLoading}>
              <div className="flex items-baseline gap-2">
                <div className="font-bold text-3xl">액션 그룹</div>
                {<ActionGroupStatusChip enabled={actionGroup?.enabled} />}
              </div>
            </Skeleton>
          </div>
          <SectionTitle title="기본 설정">
            <Skeleton className="rounded-lg w-full" isLoaded={!isPageLoading}>
              <div className="flex flex-col w-full gap-4">
                <Input
                  className=" w-full max-w-md "
                  isRequired
                  errorMessage="액션 그룹명은 필수값입니다."
                  label="액션 그룹명"
                  labelPlacement="outside"
                  placeholder="액션 그룹명을 입력하세요."
                  name="name"
                  description="액션그룹의 이름 입니다."
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <Input
                  className=" w-full max-w-md "
                  isRequired
                  errorMessage="액션 그룹 설명은 필수값입니다."
                  label="액션 그룹 설명"
                  labelPlacement="outside"
                  name="eventDescription"
                  placeholder="액션 그룹에 대해 알려주세요."
                  type="text"
                  description="액션 그룹에 대한 상세 설명입니다."
                  value={editDescription}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </Skeleton>
          </SectionTitle>
          {/*<Skeleton className="rounded-lg w-full" isLoaded={!isEventLoading}></Skeleton>*/}
          <SectionTitle title="유량 제어">
            <Skeleton className="rounded-lg w-full" isLoaded={!isPageLoading}>
              <div className="flex flex-col w-full gap-4">
                <div>
                  <div className="mb-2 text-sm after:content-['*'] after:text-danger after:ms-0.5">
                    대기열 활성/비활성화
                  </div>

                  <Switch
                    isSelected={isEnabled}
                    onValueChange={setIsEnabled}
                    classNames={{
                      base: cn(
                        'inline-flex flex-row-reverse w-full max-w-md bg-content1 hover:bg-content2 items-center',
                        'justify-between cursor-pointer rounded-lg gap-2 p-4 border-2 border-default',
                        'data-[selected=true]:border-primary'
                      ),
                      wrapper: 'p-0 h-4 overflow-visible',
                      thumb: cn(
                        'w-6 h-6 border-2 shadow-lg',
                        'group-data-[hover=true]:border-primary',
                        //selected
                        'group-data-[selected=true]:ms-6',
                        // pressed
                        'group-data-[pressed=true]:w-7',
                        'group-data-pressed:group-data-selected:ms-4'
                      ),
                    }}
                  >
                    <div className="flex flex-col gap-1">
                      <p className="text-medium">{enabledMessage[isEnabled]?.title}</p>
                      <p className="text-tiny text-default-400">{enabledMessage[isEnabled]?.subtitle}</p>
                    </div>
                  </Switch>
                </div>
                <NumberInput
                  isRequired
                  className="w-full max-w-md"
                  classNames={{
                    inputWrapper: 'max-w-[10rem]',
                  }}
                  errorMessage="최대 활성사용자수는 필수값입니다."
                  label="최대 활성사용자수"
                  labelPlacement="outside"
                  name="queueBackpressure"
                  placeholder=" "
                  minValue={0}
                  description={
                    <div className="flex flex-col">
                      <span>액션 그룹 내 최대 활성 사용자 수를 제한합니다.</span>{' '}
                      <span>0으로 설정하면 진입이 멈춥니다.</span>
                    </div>
                  }
                  value={editMaxActiveCustomers}
                  // onChange={handleMaxActiveCustomersChange}
                  onValueChange={handleMaxActiveCustomersChange}
                />
              </div>
            </Skeleton>
          </SectionTitle>
          <SectionTitle title="액션 목록">
            <Skeleton className="rounded-lg" isLoaded={!isPageLoading}>
              <ActionListTable actions={actionGroup?.actions} onPress={onPressAction} />
            </Skeleton>
          </SectionTitle>
        </div>
        <div className="bottom-2 sticky mt-4 w-full bg-white rounded-xl z-20">
          <Button color="primary" type="submit" isLoading={isSubmitLoading} fullWidth>
            저장하기
          </Button>
        </div>
      </Form>

      <ActionEditModal />

      <ConfirmModal
        isOpen={isOpenConfirm}
        onOpenChange={onOpenChangeConfirm}
        title="이벤트 삭제"
        message="정말로 이 이벤트를 삭제하시겠습니까?"
        onConfirm={handleDeleteConfirmed}
        onCancel={onCloseConfirm}
      />

      <ActionEditModal
        actionId={actionId}
        isOpen={isOpenAction}
        onOpenChange={onOpenChangeAction}
        onConfirm={handleActionSaveConfirmed}
        onCancel={onCloseAction}
      />
    </>
  );
}
