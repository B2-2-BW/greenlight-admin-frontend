import {
  addToast,
  Button,
  Form,
  Input,
  NumberInput,
  Skeleton,
  Switch,
  useDisclosure,
  cn,
  Tooltip,
} from '@heroui/react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import DeleteSvg from '../../icon/Delete.jsx';
import ArrowBackSvg from '../../icon/ArrowBackSvg.jsx';
import SectionTitle from '../common/SectionTitle.jsx';
import ConfirmModal from '../ConfirmModal.jsx';
import ActionGroupStatusChip from './ActionGroupStatusChip.jsx';
import NotFoundPage from '../../page/NotFoundPage.jsx';
import SomethingWentWrongPage from '../../page/SomethingWentWrongPage.jsx';
import ActionListTable from '../action/ActionListTable.jsx';
import ActionEditModal from '../action/ActionEditModal.jsx';
import { PlusIcon } from '../../icon/Icons.jsx';
import { ActionGroupClient } from '../../api/action-group/index.js';
import { ToastUtil } from '../../util/toastUtil.js';
import { ActionUtil } from '../../util/actionUtil.js';
import { requiredInputProps } from '../../shared/props.js';

const enabledMessage = {
  true: {
    title: '대기열 활성화',
    subtitle: '액션 그룹에 대기열이 적용되어 활성사용자 수를 제어합니다.',
  },
  false: {
    title: '대기열 비활성화',
    subtitle: '액션 그룹에 대기열이 적용되지 않고, 즉시 진입이 가능한 상태가 됩니다',
  },
};

export default function ActionGroupDetailForm({ onPressBack }) {
  const [errorStatus, setErrorStatus] = useState(null);
  const { actionGroupId } = useParams();

  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const [actionGroup, setActionGroup] = useState(null);
  const [actionId, setActionId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setDescription] = useState('');
  const [editMaxTrafficPerSecond, setEditMaxTrafficPerSecond] = useState(0);
  const [editEnabled, setEditEnabled] = useState(true);

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
    setEditMaxTrafficPerSecond(0);
    setEditEnabled(false);
  };

  const handleMaxTrafficPerSecondChange = (val) => {
    setEditMaxTrafficPerSecond(val);
  };

  const fetchActionGroup = async () => {
    setIsPageLoading(true);
    clearForm();

    try {
      const data = await ActionGroupClient.getActionGroupById(actionGroupId);
      setActionGroup(data);
      setEditName(data.name || '');
      setDescription(data.description || '');
      setEditMaxTrafficPerSecond(data.maxTrafficPerSecond ?? 0);
      setEditEnabled(data?.enabled != null ? data.enabled : false);
    } catch (error) {
      console.error('Error fetching:', error);
      setErrorStatus(error.status);
    } finally {
      setIsPageLoading(false);
    }
  };

  // Location 이동 시 실행
  useEffect(() => {
    if (!actionGroupId) {
      return;
    }
    fetchActionGroup();
  }, [actionGroupId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitLoading(true);

    const data = {
      name: editName,
      description: editDescription,
      maxTrafficPerSecond: editMaxTrafficPerSecond,
      enabled: editEnabled,
    };

    try {
      if (actionGroupId) {
        // actionGroupId가 있는 경우 업데이트 화면
        await ActionGroupClient.updateActionGroupById(actionGroupId, data);
        await fetchActionGroup();
      } else {
        // 없는 경우 생성 화면
        const response = await ActionGroupClient.createActionGroup(data);
        if (response.status === 201) {
          navigate(`/action-groups/${response.data.id}`);
        } else {
          throw new Error('failed to create action group ' + JSON.stringify(response));
        }
      }
      ToastUtil.success('액션 그룹 상세', '성공적으로 저장했습니다.');
    } catch (error) {
      console.error(error.response);
      ToastUtil.error('액션 그룹 상세', '저장에 실패했습니다.');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    setIsSubmitLoading(true);
    try {
      await ActionGroupClient.deleteActionGroupById(actionGroupId);
      ToastUtil.success('액션 그룹 삭제', '액션 그룹이 성공적으로 삭제되었습니다.');
      navigate('/action-groups');
    } catch (error) {
      if (error.status === 409) {
        ToastUtil.error('액션 그룹을 삭제할 수 없습니다,', error.response?.data?.detail);
        onCloseConfirm();
      } else {
        console.error('삭제 실패:', error);
        ToastUtil.error('액션 그룹 삭제', '삭제에 실패했습니다.');
      }
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleActionSaveConfirmed = async () => {
    await fetchActionGroup();
    await onCloseAction();
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
        onSubmit={handleSubmit}
      >
        <div className="relative w-full flex flex-col gap-4">
          <div className="w-full">
            <div className="flex justify-between items-center">
              <div className="text-sm text-default-400 mb-1">{actionGroup?.name}</div>
              <div className="flex flex-row gap-6">
                {actionGroupId && (
                  <Tooltip content="액션 그룹 삭제하기">
                    <Button size="sm" className="p-1" isIconOnly variant="light" onPress={onOpenConfirm}>
                      <DeleteSvg />
                    </Button>
                  </Tooltip>
                )}
                <Tooltip content="뒤로가기">
                  <Button size="sm" isIconOnly variant="light" onPress={onPressBack}>
                    <ArrowBackSvg />
                  </Button>
                </Tooltip>
              </div>
            </div>
            <Skeleton className="rounded-lg w-full h-10" isLoaded={!isPageLoading}>
              <div className="flex items-baseline gap-2">
                <div className="font-bold text-3xl">액션 그룹 {actionGroupId == null ? '생성' : '상세'}</div>
                {<ActionGroupStatusChip enabled={actionGroup?.enabled} />}
              </div>
            </Skeleton>
          </div>
          <SectionTitle title="기본 설정">
            <Skeleton className="rounded-lg w-full" isLoaded={!isPageLoading}>
              <div className="flex flex-col w-full gap-6">
                <Input
                  className="w-full max-w-md"
                  label="액션 그룹명"
                  placeholder="액션 그룹명을 입력하세요."
                  name="name"
                  description="액션그룹의 이름 입니다."
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  {...requiredInputProps}
                />
                <Input
                  className="w-full max-w-md"
                  errorMessage="액션 그룹 설명은 필수값입니다."
                  label="액션 그룹 설명"
                  name="eventDescription"
                  placeholder="액션 그룹에 대해 알려주세요."
                  type="text"
                  description="액션 그룹에 대한 상세 설명입니다."
                  value={editDescription}
                  onChange={(e) => setDescription(e.target.value)}
                  {...requiredInputProps}
                />
              </div>
            </Skeleton>
          </SectionTitle>
          {/*<Skeleton className="rounded-lg w-full" isLoaded={!isEventLoading}></Skeleton>*/}
          <SectionTitle title="유량 제어">
            <Skeleton className="rounded-lg w-full" isLoaded={!isPageLoading}>
              <div className="flex flex-col w-full gap-6">
                <div>
                  <div className="mb-2 text-base after:content-['*'] after:text-danger after:ms-0.5">
                    액션 그룹 활성/비활성화
                  </div>

                  <Switch
                    isSelected={editEnabled}
                    onValueChange={setEditEnabled}
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
                      <p className="text-base">{enabledMessage[editEnabled]?.title}</p>
                      <p className="text-sm text-default-400">{enabledMessage[editEnabled]?.subtitle}</p>
                    </div>
                  </Switch>
                </div>
                <NumberInput
                  className="w-full max-w-md"
                  label="초당 유입량"
                  name="maxTrafficPerSecond"
                  placeholder=" "
                  minValue={0}
                  description={
                    <div className="flex flex-col text-sm">
                      <span>액션 그룹 내 유입되는 사용자 수를 제한합니다.</span>
                      <span>0으로 설정하면 진입이 멈춥니다.</span>
                    </div>
                  }
                  value={editMaxTrafficPerSecond}
                  // onChange={handleMaxTrafficPerSecondChange}
                  onValueChange={handleMaxTrafficPerSecondChange}
                  {...requiredInputProps}
                  classNames={{
                    inputWrapper: 'max-w-[10rem]',
                  }}
                />
              </div>
            </Skeleton>
          </SectionTitle>
          {actionGroupId && (
            <SectionTitle
              title="액션 목록"
              endContent={
                <Button size="md" color="primary" variant="bordered" onPress={() => onPressAction(null)}>
                  <div className="flex items-center gap-1">
                    <PlusIcon size={18} strokeWidth={3} />
                    <span className="font-semibold">액션 추가하기</span>
                  </div>
                </Button>
              }
            >
              <Skeleton className="rounded-lg" isLoaded={!isPageLoading}>
                <ActionListTable actions={actionGroup?.actions} onPress={onPressAction} />
              </Skeleton>
            </SectionTitle>
          )}
        </div>
        <div className="bottom-2 sticky mt-4 w-full bg-white rounded-xl z-20">
          <Button size="lg" color="primary" variant="shadow" type="submit" isLoading={isSubmitLoading} fullWidth>
            저장하기
          </Button>
        </div>
      </Form>

      <ConfirmModal
        isOpen={isOpenConfirm}
        onOpenChange={onOpenChangeConfirm}
        title="액션 그룹 삭제"
        message="정말로 이 액션 그룹을 삭제하시겠습니까?"
        onConfirm={handleDeleteConfirmed}
        onCancel={onCloseConfirm}
      />

      <ActionEditModal
        actionId={actionId}
        actionGroupId={actionGroupId}
        isOpen={isOpenAction}
        onOpenChange={onOpenChangeAction}
        onConfirm={handleActionSaveConfirmed}
        onCancel={onCloseAction}
      />
    </>
  );
}
