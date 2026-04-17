import { useState } from 'react';
import {
  AlertDialog,
  Button,
  ButtonGroup,
  Input,
  Label,
  Popover,
  Separator,
  Spinner,
  TextField,
  useOverlayState,
} from '@heroui/react';
import { Gear, Power } from '@gravity-ui/icons';
import { AnimatePresence, motion } from 'framer-motion';
import { ToastUtil } from '../../util/toastUtil.js';
import { useDashboard } from '../../provider/DashboardProvider.jsx';
import { RoomClient } from '../../api/room/index.js';

/**
 * @param {number} value - 현재 설정된 최대 수용 인원
 * @param {function} onChange - 변경 시 콜백 (newValue) => void
 * @param {number} step - 버튼 클릭 시 증감 단위 (기본 100)
 */

const steps = [-100, -10, 10, 100];

function DisableAlert({ children, isOpen, onOpenChange, onConfirm }) {
  return (
    <AlertDialog isOpen={isOpen} onOpenChange={onOpenChange}>
      {children}
      <AlertDialog.Backdrop className="z-100001">
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-[400px]">
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
              <Button slot="close" variant="danger" onPress={onConfirm}>
                대기열 비활성화
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  );
}

const QuickSetting = ({ room }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editCapacity, setEditCapacity] = useState(0);
  const [isCapacitySubmitLoading, setIsCapacitySubmitLoading] = useState(false);
  const [isCapacityUpdated, setIsCapacityUpdated] = useState(false);
  const disableAlertState = useOverlayState();
  const { fetchRoomById, fetchRoomList } = useDashboard();

  const handleCapacityChangeSubmit = async () => {
    if (!room?.roomId) {
      ToastUtil.error('변경 실패', `비정상적인 roomId입니다. ${JSON.stringify(room)}`);
    }
    setIsCapacitySubmitLoading(true);
    const finalCapacity = Math.max(0, Number(editCapacity)); // 음수 방지
    setEditCapacity(finalCapacity);
    await RoomClient.updateRoomById(room.roomId, { capacity: finalCapacity });
    // API 호출
    ToastUtil.success('변경 성공', `최대 수용 인원: ${room?.capacity} → ${finalCapacity}`);
    await fetchRoomById(room.roomId);
    setIsCapacitySubmitLoading(false);
    setIsCapacityUpdated(false);
  };

  const handleQuickSettingOpen = (open) => {
    if (open) {
      setEditCapacity(room?.capacity);
      setIsCapacityUpdated(false);
      setIsCapacitySubmitLoading(false);
    }
    setIsOpen(open);
  };

  // 변경 사항 적용 핸들러
  const handleOnCapacityChange = (value) => {
    setIsCapacityUpdated(value != room?.capacity);
    setEditCapacity(value);
  };

  // 빠른 증감 함수
  const adjustCapacity = (amount) => {
    handleOnCapacityChange(Math.max(0, Number(editCapacity) + amount));
  };

  const disableRoom = async () => {
    // disable 시키는 API 호출하고
    // dashboard 재조회 (useProvider 써야할듯)
    await RoomClient.updateRoomById(room.roomId, { enabled: false });
    await fetchRoomList();
    ToastUtil.success('비활성화 성공', `대기열 비활성화: ${room?.name} (${room.roomId})`);
    setIsOpen(false);
  };

  return (
    <>
      {/*<DisableAlert*/}
      {/*  isOpen={disableAlertState.isOpen}*/}
      {/*  onOpenChange={disableAlertState.setOpen}*/}
      {/*  onConfirm={disableRoom}*/}
      {/*/>*/}

      <Popover isOpen={isOpen} onOpenChange={handleQuickSettingOpen}>
        <Button isIconOnly variant="ghost">
          <Gear />
        </Button>

        <Popover.Content placement="bottom left" className="border-black/20 border">
          <Popover.Dialog className="flex flex-col gap-2">
            <Popover.Heading className="font-semibold">
              빠른설정 | <span className="font-normal">{room.name}</span>
            </Popover.Heading>
            <Separator />
            <div className="w-50 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <TextField type="number" inputMode="numeric">
                  <Label className="text-sm text-neutral-600">최대 수용 인원</Label>
                  <div className="flex gap-2">
                    <Input
                      fullWidth
                      className="ring-1 focus:ring-2 ring-neutral-200 focus:ring-accent"
                      value={editCapacity}
                      onChange={(e) => handleOnCapacityChange(e.target.value)}
                    />

                    <AnimatePresence>
                      {isCapacityUpdated && (
                        <motion.div
                          key="save-btn"
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: 'auto', opacity: 1 }}
                          exit={{ width: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                          style={{ overflow: 'hidden', flexShrink: 0 }}
                        >
                          <Button onPress={handleCapacityChangeSubmit} isPending={isCapacitySubmitLoading}>
                            {isCapacitySubmitLoading ? (
                              <Spinner color="current" size="sm" />
                            ) : (
                              <span>
                                {editCapacity - room?.capacity !== 0 ? '+' : '-'}{' '}
                                {Math.abs(editCapacity - room?.capacity)}
                              </span>
                            )}
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </TextField>
                <ButtonGroup size="sm" fullWidth variant="tertiary">
                  {steps.map((step, i) => (
                    <Button
                      className="min-w-10"
                      onPress={() => adjustCapacity(step)}
                      key={i}
                      isDisabled={step < 0 ? editCapacity === 0 : false}
                    >
                      <span> {step < 0 ? step : `+${step}`}</span>
                    </Button>
                  ))}
                </ButtonGroup>
              </div>
              <Separator />
              <div className="flex flex-col gap-2">
                <DisableAlert
                  isOpen={disableAlertState.isOpen}
                  onOpenChange={disableAlertState.setOpen}
                  onConfirm={disableRoom}
                >
                  <Button variant="danger-soft" fullWidth isDisabled={room?.enabled === false}>
                    <Power />
                    대기열 비활성화
                  </Button>
                </DisableAlert>
              </div>
            </div>
          </Popover.Dialog>
        </Popover.Content>
      </Popover>
    </>
  );
};

export default QuickSetting;
