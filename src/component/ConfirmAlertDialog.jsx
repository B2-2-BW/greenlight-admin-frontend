import { AlertDialog, Button } from '@heroui/react';

export default function ConfirmAlertDialog({
  children,
  isOpen,
  onConfirm,
  onOpenChange,
  title,
  message,
  confirmMessage,
  isConfirmDisabled = false,
}) {
  return (
    <AlertDialog isOpen={isOpen} onOpenChange={onOpenChange}>
      {children}
      <AlertDialog.Backdrop className="z-49">
        <AlertDialog.Container>
          <AlertDialog.Dialog className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-[400px]">
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>{title}</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>{message}</AlertDialog.Body>
            <AlertDialog.Footer className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button slot="close" variant="tertiary" className="min-h-11 w-full sm:w-auto">
                취소하기
              </Button>
              <Button
                slot="close"
                variant="danger"
                onPress={onConfirm}
                isDisabled={isConfirmDisabled}
                className="min-h-11 w-full sm:w-auto"
              >
                {confirmMessage || '확인'}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  );
}
