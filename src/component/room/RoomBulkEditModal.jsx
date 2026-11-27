import { Button, FieldError, Input, Label, Modal, TextField, ToggleButton, ToggleButtonGroup } from '@heroui/react';
import { useId, useState } from 'react';
import { RoomClient } from '../../api/room/index.js';
import { ToastUtil } from '../../util/toastUtil.js';
import RoomDisableAlert from './RoomDisableAlert.jsx';

const MAX_COUNT = 2147483647;
const environmentLabels = { LIVE: '운영', DEV: '개발' };
const previewFields = [
  { key: 'capacity', label: '최대 수용 인원', unit: '명' },
  { key: 'maxTrafficPerSecond', label: '초당 유입량', unit: '명/초' },
  { key: 'enabled', label: '대기열 활성 상태' },
];

function countValue(value) {
  if (!/^\d+$/.test(value)) return null;
  const count = Number(value);
  return count <= MAX_COUNT ? count : null;
}

function CountSetting({ label, unit, value, onChange, isInvalid, isPending }) {
  return (
    <TextField inputMode="numeric" isDisabled={isPending} isInvalid={isInvalid}>
      <div className="flex items-center justify-between gap-2">
        <Label className="text-sm font-medium">{label}</Label>
        <span className="text-xs text-muted">{unit}</span>
      </div>
      <Input
        fullWidth
        placeholder="유지"
        className="tabular-nums ring-1 ring-separator focus:ring-2 focus:ring-accent"
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
      <FieldError>올바른 숫자를 입력해 주세요.</FieldError>
    </TextField>
  );
}

function formatPreviewValue(value, unit) {
  if (value == null) return '-';
  if (typeof value === 'boolean') return value ? '활성' : '비활성';
  return `${value.toLocaleString('ko-KR')}${unit}`;
}

function SelectedRoomPreview({ rooms, updates }) {
  const labelId = useId();
  const fields = previewFields.filter(({ key }) => key in updates);

  return (
    <section className="min-w-0" aria-labelledby={labelId}>
      <h3 id={labelId} className="mb-2 text-sm font-medium text-foreground">
        변경 사항
      </h3>
      <ul className="max-h-64 divide-y divide-separator overflow-y-auto rounded-lg border border-separator bg-neutral-50 px-3">
        {rooms.map((room) => {
          const changes = fields.filter(({ key }) => room[key] !== updates[key]);
          const environment = environmentLabels[room.roomEnvironment] ?? room.roomEnvironment;

          return (
            <li key={room.roomId} className="py-3">
              <p className="wrap-break-word text-sm font-medium">
                {room.name}
                {environment && (
                  <>
                    {' '}
                    <span className="whitespace-nowrap font-normal text-muted">({environment})</span>
                  </>
                )}
              </p>
              {changes.length > 0 ? (
                <dl className="mt-2 space-y-1.5 text-xs">
                  {changes.map(({ key, label, unit }) => (
                    <div key={key} className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                      <dt className="text-muted">{label}</dt>
                      <dd className="flex items-center gap-1.5 tabular-nums">
                        <span className="text-muted">{formatPreviewValue(room[key], unit)}</span>
                        <span className="text-muted" aria-hidden="true">
                          →
                        </span>
                        <span className="sr-only">에서</span>
                        <span className="font-semibold">{formatPreviewValue(updates[key], unit)}</span>
                        <span className="sr-only">으로 변경</span>
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-1 text-xs text-muted">변경 없음</p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function RoomBulkEditModal({ rooms, onClose, onSaved }) {
  const [capacity, setCapacity] = useState('');
  const [traffic, setTraffic] = useState('');
  const [enabled, setEnabled] = useState('KEEP');
  const [isPending, setIsPending] = useState(false);
  const [isDisableAlertOpen, setIsDisableAlertOpen] = useState(false);
  const statusLabelId = useId();
  const capacityValue = countValue(capacity);
  const trafficValue = countValue(traffic);
  const hasCapacity = capacity !== '';
  const hasTraffic = traffic !== '';
  const isCapacityInvalid = hasCapacity && capacityValue === null;
  const isTrafficInvalid = hasTraffic && trafficValue === null;
  const canSave =
    rooms.length > 0 && (hasCapacity || hasTraffic || enabled !== 'KEEP') && !isCapacityInvalid && !isTrafficInvalid;
  const stopsEntry = capacityValue === 0 || trafficValue === 0;
  const updates = {
    ...(capacityValue !== null && { capacity: capacityValue }),
    ...(trafficValue !== null && { maxTrafficPerSecond: trafficValue }),
    ...(enabled !== 'KEEP' && { enabled: enabled === 'ENABLED' }),
  };

  const save = async () => {
    if (!canSave || isPending) return;
    setIsPending(true);
    try {
      await RoomClient.bulkUpdateRooms({
        roomIds: rooms.map((room) => room.roomId),
        ...updates,
      });
      ToastUtil.success('대기열 일괄 수정', '대기열 설정을 저장했습니다.');
      onSaved();
    } catch (error) {
      const detail = error.response?.data?.detail;
      ToastUtil.error('대기열 일괄 수정', typeof detail === 'string' ? detail : '대기열 설정을 저장하지 못했습니다.');
    } finally {
      setIsPending(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSave || isPending || isDisableAlertOpen) return;
    if (enabled === 'DISABLED') {
      setIsDisableAlertOpen(true);
      return;
    }
    void save();
  };

  return (
    <>
      <Modal
        isOpen
        onOpenChange={(open) => {
          if (!open && !isPending && !isDisableAlertOpen) onClose();
        }}
      >
        <Modal.Backdrop isDismissable={!isPending && !isDisableAlertOpen}>
          <Modal.Container placement="auto" scroll="inside">
            <Modal.Dialog className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-sm:max-h-[calc(100dvh-5rem)] max-sm:w-full sm:max-w-3xl">
              <Modal.Header className="mb-4">
                <Modal.Heading className="font-semibold">대기열 일괄 수정</Modal.Heading>
              </Modal.Header>
              <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
                <Modal.Body className="min-h-0">
                  <div className="grid items-start gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
                    <div className="flex min-w-0 flex-col gap-4">
                      <CountSetting
                        label="최대 수용 인원"
                        unit="명"
                        value={capacity}
                        onChange={setCapacity}
                        isInvalid={isCapacityInvalid}
                        isPending={isPending}
                      />
                      <CountSetting
                        label="초당 유입량"
                        unit="명/초"
                        value={traffic}
                        onChange={setTraffic}
                        isInvalid={isTrafficInvalid}
                        isPending={isPending}
                      />
                      <div className="flex flex-col gap-2">
                        <span id={statusLabelId} className="text-sm font-medium text-foreground">
                          대기열 활성 상태
                        </span>
                        <ToggleButtonGroup
                          fullWidth
                          aria-labelledby={statusLabelId}
                          disallowEmptySelection
                          isDisabled={isPending}
                          selectedKeys={[enabled]}
                          onSelectionChange={(keys) => setEnabled([...keys][0] ?? 'KEEP')}
                        >
                          <ToggleButton id="KEEP">유지</ToggleButton>
                          <ToggleButton id="ENABLED">활성</ToggleButton>
                          <ToggleButton
                            id="DISABLED"
                            className="[--toggle-button-bg-selected:var(--danger-soft)] [--toggle-button-bg-selected-hover:var(--danger-soft-hover)] [--toggle-button-bg-selected-pressed:var(--danger-soft-hover)] [--toggle-button-fg-selected:var(--danger-soft-foreground)]"
                          >
                            비활성
                          </ToggleButton>
                        </ToggleButtonGroup>
                      </div>
                      {stopsEntry && enabled !== 'DISABLED' && (
                        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                          활성 대기열의 최대 수용 인원이나 초당 유입량을 0으로 설정하면 고객 진입이 멈춥니다.
                        </p>
                      )}
                    </div>
                    <SelectedRoomPreview rooms={rooms} updates={updates} />
                  </div>
                </Modal.Body>
                <Modal.Footer className="shrink-0 justify-end border-t border-separator pt-4 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
                  <Button type="button" variant="tertiary" isDisabled={isPending} onPress={onClose}>
                    취소
                  </Button>
                  <Button type="submit" isDisabled={!canSave || isPending} isPending={isPending}>
                    저장
                  </Button>
                </Modal.Footer>
              </form>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
      <RoomDisableAlert
        isOpen={isDisableAlertOpen}
        onOpenChange={(open) => {
          if (!isPending) setIsDisableAlertOpen(open);
        }}
        onConfirm={save}
        isPending={isPending}
      />
    </>
  );
}
