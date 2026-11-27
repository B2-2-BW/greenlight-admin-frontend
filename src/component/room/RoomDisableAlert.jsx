import { AlertDialog, Button } from '@heroui/react';

export default function RoomDisableAlert({ isOpen, onOpenChange, onConfirm, isPending }) {
  return (
    <AlertDialog isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Backdrop>
        <AlertDialog.Container>
          <AlertDialog.Dialog className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-[400px]">
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>정말로 계속하시겠습니까?</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p>대기열이 비활성화되고 현재 대기 중인 고객은 즉시 입장하게 됩니다.</p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary">
                취소하기
              </Button>
              <Button variant="danger" onPress={onConfirm} isPending={isPending}>
                {isPending ? '저장 중' : '저장하기'}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  );
}
