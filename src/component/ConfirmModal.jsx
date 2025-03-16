import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

export default function ConfirmModal({ 
  isOpen, 
  onOpenChange, 
  title, 
  message, 
  onConfirm, 
  onCancel 
}) {
  return (
    <Modal isDismissable={false} isKeyboardDismissDisabled={true} isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
          <ModalBody>
            <p>{message}</p>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onCancel}>
              취소
            </Button>
            <Button color="primary" onPress={onConfirm}>
              확인
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
}
