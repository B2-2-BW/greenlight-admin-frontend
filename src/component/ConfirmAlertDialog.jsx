import { AlertDialog, Button } from '@heroui/react';

export default function ConfirmAlertDialog({
  children,
  isOpen,
  onConfirm,
  onOpenChange,
  title,
  message,
  confirmMessage,
}) {
  return (
    <AlertDialog isOpen={isOpen} onOpenChange={onOpenChange}>
      {children}
      <AlertDialog.Backdrop className="z-49">
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-[400px]">
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>{title}</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>{message}</AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary">
                취소하기
              </Button>
              <Button slot="close" variant="danger" onPress={onConfirm}>
                {confirmMessage || '확인'}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  );
}
