import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  useDraggable,
  Form,
  Input,
} from '@heroui/react';
import { useRef, useState } from 'react';
import RangedDateTimePicker from './RangedDateTimePicker.jsx';

export default function EventDetailModal({ isOpen, onOpenChange }) {
  const targetRef = useRef(null);
  const { moveProps } = useDraggable({ targetRef, isDisabled: !isOpen });
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState('');
  const {
    isOpen: isConfirmOpen,
    onOpen: onConfirmOpen,
    onOpenChange: onConfirmOpenChange,
  } = useDisclosure();

  const [action, setAction] = useState(null); // sumbit 클릭 시 실행

  const handleClose = () => {
    if (hasChanges) {
      onConfirmOpen();
    } else {
      onOpenChange(false);
    }
  };

  const handleSaveAndClose = () => {
    // Save logic here
    console.log('Saving changes:', formData);
    setHasChanges(false);
    onOpenChange(false);
  };

  const handleForceClose = () => {
    setHasChanges(false);
    onOpenChange(false);
    onConfirmOpenChange(false);
  };

  const eventFakeData = {
    eventSeq: 2,
    eventName: 'test',
    eventDescription: '테스트 이벤트',
    eventType: '타입',
    eventUrl:
      'https://www.thehyundai.com/front/pda/itemPtc.thd?slitmCd=40A1901936',
    queueBackpressure: 5,
    eventStartTime: '2025-03-13T11:50:30.143',
    eventEndTime: '2025-03-14T02:48:58.143',
    createdBy: 'SYSTEM',
    createdAt: '2025-02-27T20:14:00.418071',
    updatedBy: 'SYSTEM',
    updatedAt: '2025-03-13T11:49:48.464422',
  };
  return (
    <>
      <Modal ref={targetRef} isOpen={isOpen} onOpenChange={handleClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader {...moveProps} className="flex flex-col gap-1">
                이벤트 상세
              </ModalHeader>
              <ModalBody>
                <Form
                  className="w-full max-w-xs flex flex-col gap-4"
                  onReset={() => setAction('reset')}
                  onSubmit={(e) => {
                    e.preventDefault();
                    let data = Object.fromEntries(
                      new FormData(e.currentTarget)
                    );
                    setAction(`submit ${JSON.stringify(data)}`);
                  }}
                >
                  <Input
                    isRequired
                    errorMessage="이벤트명은 필수값입니다."
                    label="이벤트명"
                    labelPlacement="outside"
                    name="eventName"
                    placeholder="이벤트명을 입력하세요."
                    type="text"
                  />
                  <Input
                    isRequired
                    errorMessage="이벤트명은 필수값입니다."
                    label="이벤트 설명"
                    labelPlacement="outside"
                    name="eventDescription"
                    placeholder="이벤트 설명을 입력하세요."
                    type="text"
                  />
                  <Input
                    isRequired
                    errorMessage="이벤트명은 필수값입니다."
                    label="이벤트명"
                    labelPlacement="outside"
                    name="eventName"
                    placeholder="이벤트명을 입력하세요."
                    type="text"
                  />
                  <RangedDateTimePicker />
                </Form>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Action
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      {/* Confirmation Modal */}
      <Modal isOpen={isConfirmOpen} onOpenChange={onConfirmOpenChange}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                저장하지 않고 페이지를 나가시겠어요?
              </ModalHeader>
              <ModalBody>
                <p>페이지 이탈 시 저장하지 않은 정보는 잃어버리게 됩니다.</p>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="default"
                  variant="light"
                  onPress={() => onConfirmOpenChange(false)}
                >
                  닫기
                </Button>
                <Button color="danger" onPress={handleForceClose}>
                  저장하지 않고 나가기
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
