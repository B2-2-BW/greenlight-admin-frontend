import { useState } from 'react';
import {
  AlertDialog,
  Button,
  ButtonGroup,
  Description,
  FieldError,
  Input,
  Label,
  Modal,
  Separator,
  TextField,
  useOverlayState,
} from '@heroui/react';
import { Gear, Power } from '@gravity-ui/icons';
import { ToastUtil } from '../../util/toastUtil.js';
import { useDashboard } from '../../provider/DashboardProvider.jsx';
import { RoomClient } from '../../api/room/index.js';
import { useUserStore } from '../../store/user.jsx';

const settingFields = [
  {
    key: 'capacity',
    label: '최대 수용 인원',
    unit: '명',
    description: '화면에 머무를 수 있는 최대 사용자 수',
    steps: [-100, -10, 10, 100],
  },
  {
    key: 'maxTrafficPerSecond',
    label: '초당 유입량',
    unit: '명/초',
    description: '1초마다 화면에 입장시키는 사용자 수',
    steps: [-10, -1, 1, 10],
  },
];

const getRoomSetting = (room, key) => {
  const value = Number(room?.[key] ?? 0);
  return Number.isSafeInteger(value) && value >= 0 ? value : 0;
};

const createDraft = (room) =>
  Object.fromEntries(settingFields.map(({ key }) => [key, String(getRoomSetting(room, key))]));

const parseSettingValue = (value) => {
  if (value.trim() === '') return null;

  const numberValue = Number(value);
  return Number.isSafeInteger(numberValue) && numberValue >= 0 ? numberValue : null;
};

function QuickNumberSetting({ label, unit, description, value, steps, error, isPending, onChange, onAdjust }) {
  const numericValue = parseSettingValue(value);

  return (
    <div className="flex flex-col gap-2">
      <TextField type="number" inputMode="numeric" isInvalid={Boolean(error)}>
        <div className="flex items-center justify-between gap-2">
          <Label className="text-sm font-medium text-neutral-700">{label}</Label>
          <span className="text-xs text-neutral-500">{unit}</span>
        </div>
        <Input
          fullWidth
          min={0}
          step={1}
          className="tabular-nums ring-1 ring-neutral-200 focus:ring-2 focus:ring-accent"
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
          isDisabled={isPending}
        />
        {error ? (
          <FieldError>{error}</FieldError>
        ) : (
          <Description className="text-xs text-neutral-500">{description}</Description>
        )}
      </TextField>
      <ButtonGroup size="sm" fullWidth variant="tertiary" aria-label={`${label} 빠른 조정`}>
        {steps.map((step) => (
          <Button
            className="min-w-12 tabular-nums"
            onPress={() => onAdjust(step)}
            key={step}
            isDisabled={isPending || (step < 0 && numericValue === 0)}
          >
            {step > 0 ? `+${step}` : step}
          </Button>
        ))}
      </ButtonGroup>
    </div>
  );
}

function DisableAlert({ isOpen, onOpenChange, onConfirm, isPending }) {
  return (
    <AlertDialog isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Backdrop>
        <AlertDialog.Container>
          <AlertDialog.Dialog className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-[400px]">
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>정말로 대기열을 비활성화 하시겠습니까?</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p>대기열이 비활성화되고 현재 대기중인 고객은 즉시 입장하게 됩니다.</p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary">
                취소하기
              </Button>
              <Button variant="danger" onPress={onConfirm} isPending={isPending}>
                {isPending ? '비활성화 중' : '대기열 비활성화'}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  );
}

const QuickSetting = ({ room }) => {
  const role = useUserStore((state) => state.user?.userRole ?? state.user?.role);
  const canManageRooms = role === 'SITE_ADMIN' || role === 'SUPER';
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(() => createDraft(room));
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [isDisableLoading, setIsDisableLoading] = useState(false);
  const disableAlertState = useOverlayState();
  const { fetchRoomById, fetchRoomList } = useDashboard();

  const originalValues = Object.fromEntries(settingFields.map(({ key }) => [key, getRoomSetting(room, key)]));
  const parsedValues = Object.fromEntries(settingFields.map(({ key }) => [key, parseSettingValue(draft[key])]));
  const errors = Object.fromEntries(
    settingFields.map(({ key }) => [key, parsedValues[key] === null ? '0 이상의 정수를 입력해 주세요.' : ''])
  );
  const hasError = Object.values(errors).some(Boolean);
  const isDirty = settingFields.some(({ key }) =>
    errors[key] ? draft[key] !== String(originalValues[key]) : parsedValues[key] !== originalValues[key]
  );
  const changedFields = settingFields.filter(({ key }) => !errors[key] && parsedValues[key] !== originalValues[key]);
  const hasZeroValue = settingFields.some(
    ({ key }) => !errors[key] && parsedValues[key] === 0 && parsedValues[key] !== originalValues[key]
  );

  const handleSettingChangeSubmit = async () => {
    if (!room?.roomId) {
      ToastUtil.error('변경 실패', `비정상적인 roomId입니다. ${JSON.stringify(room)}`);
      return;
    }

    if (hasError || !isDirty) return;

    setIsSubmitLoading(true);
    try {
      await RoomClient.updateRoomById(room.roomId, parsedValues);
      await fetchRoomById(room.roomId);
      setDraft(Object.fromEntries(settingFields.map(({ key }) => [key, String(parsedValues[key])])));
      ToastUtil.success('변경 성공', '대기열 설정을 성공적으로 저장했습니다.');
    } catch (error) {
      console.error('Failed to update room settings:', error);
      ToastUtil.error('변경 실패', error?.response?.data?.detail ?? '대기열 설정을 저장하지 못했습니다.');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleQuickSettingOpen = (open) => {
    if (open) {
      setDraft(createDraft(room));
      setIsSubmitLoading(false);
    }
    setIsOpen(open);
  };

  const handleSettingChange = (key, value) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const adjustSetting = (key, amount) => {
    const currentValue = parseSettingValue(draft[key]) ?? 0;
    handleSettingChange(key, String(Math.max(0, currentValue + amount)));
  };

  const resetDraft = () => {
    setDraft(createDraft(room));
  };

  const openDisableAlert = () => {
    disableAlertState.setOpen(true);
  };

  const disableRoom = async () => {
    if (!room?.roomId) {
      ToastUtil.error('비활성화 실패', '대기열 정보를 확인할 수 없습니다.');
      return;
    }

    setIsDisableLoading(true);
    try {
      await RoomClient.updateRoomById(room.roomId, { enabled: false });
      await fetchRoomList();
      ToastUtil.success('비활성화 성공', `대기열 비활성화: ${room?.name} (${room.roomId})`);
      disableAlertState.setOpen(false);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to disable room:', error);
      ToastUtil.error('비활성화 실패', error?.response?.data?.detail ?? '대기열을 비활성화하지 못했습니다.');
    } finally {
      setIsDisableLoading(false);
    }
  };

  if (!canManageRooms) return null;

  const quickSettingButton = (
    <Button isIconOnly variant="ghost" aria-label={`${room?.name ?? '대기열'} 빠른 설정`} title="빠른 설정">
      <Gear />
    </Button>
  );

  const settings = (
    <>
      <div className="flex flex-col gap-5">
        {settingFields.map((field) => (
          <QuickNumberSetting
            key={field.key}
            {...field}
            value={draft[field.key]}
            error={errors[field.key]}
            isPending={isSubmitLoading}
            onChange={(value) => handleSettingChange(field.key, value)}
            onAdjust={(amount) => adjustSetting(field.key, amount)}
          />
        ))}
      </div>

      {changedFields.length > 0 && (
        <div className="rounded-lg bg-neutral-50 px-3 py-2 text-xs text-neutral-600" aria-live="polite">
          <p className="mb-1 font-medium text-neutral-700">변경 예정</p>
          {changedFields.map(({ key, label, unit }) => (
            <p key={key} className="flex items-center justify-between gap-3 tabular-nums">
              <span>{label}</span>
              <span>
                {originalValues[key].toLocaleString()} → {parsedValues[key].toLocaleString()} {unit}
              </span>
            </p>
          ))}
        </div>
      )}

      {hasZeroValue && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          0으로 설정하면 해당 대기열의 사용자 진입이 제한됩니다.
        </p>
      )}
    </>
  );

  const changeActions = (
    <div className="flex w-full justify-end gap-2">
      <Button variant="tertiary" onPress={resetDraft} isDisabled={!isDirty || isSubmitLoading}>
        되돌리기
      </Button>
      <Button
        onPress={handleSettingChangeSubmit}
        isPending={isSubmitLoading}
        isDisabled={!isDirty || hasError || isSubmitLoading}
      >
        {isSubmitLoading ? '저장 중' : '변경사항 적용'}
      </Button>
    </div>
  );

  const disableButton = (
    <Button
      variant="danger-soft"
      fullWidth
      isDisabled={room?.enabled === false || isSubmitLoading}
      onPress={openDisableAlert}
    >
      <Power />
      대기열 비활성화
    </Button>
  );

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={handleQuickSettingOpen}>
        {quickSettingButton}
        <Modal.Backdrop>
          <Modal.Container placement="auto" size="sm" scroll="inside">
            <Modal.Dialog className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-sm:max-h-[calc(100dvh-5rem)] max-sm:w-full">
              <Modal.CloseTrigger />
              <Modal.Header className="min-w-0 pr-8">
                <Modal.Heading className="font-semibold">빠른 설정</Modal.Heading>
                <p className="truncate text-sm text-neutral-500">{room?.name}</p>
              </Modal.Header>
              <Modal.Body className="flex flex-col gap-5">{settings}</Modal.Body>
              <Modal.Footer className="shrink-0 flex-col items-stretch gap-3 border-t border-separator pt-4 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
                {changeActions}
                <Separator />
                {disableButton}
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      <DisableAlert
        isOpen={disableAlertState.isOpen}
        onOpenChange={disableAlertState.setOpen}
        onConfirm={disableRoom}
        isPending={isDisableLoading}
      />
    </>
  );
};

export default QuickSetting;
