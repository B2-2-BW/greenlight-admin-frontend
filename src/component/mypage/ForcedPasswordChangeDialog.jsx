import { Button, FieldError, Form, Input, Label, Modal, TextField } from '@heroui/react';
import { useEffect, useState } from 'react';
import { UserClient } from '../../api/user/index.js';
import { ToastUtil } from '../../util/toastUtil.js';

/**
 * 로그인 전 강제 비밀번호 변경 다이얼로그.
 * 세션/토큰 없이 동작하며, 상태는 호출측(LoginPage)의 React state에만 존재한다.
 */
export default function ForcedPasswordChangeDialog({
  isOpen = false,
  loginId = '',
  initialCurrentPassword = '',
  onClose,
  onSuccess,
}) {
  const [currentPassword, setCurrentPassword] = useState(initialCurrentPassword);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setCurrentPassword(initialCurrentPassword || '');
    setNewPassword('');
    setNewPasswordConfirm('');
    setPasswordErrors({});
    setIsPending(false);
  }, [isOpen, initialCurrentPassword]);

  if (!isOpen) return null;

  const clearPasswordError = (name) => {
    setPasswordErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  };

  const changePassword = async (event) => {
    event.preventDefault();

    const validationErrors = {};
    if (!currentPassword) {
      validationErrors.currentPassword = '현재 비밀번호를 입력해 주세요.';
    }
    if (!newPassword) {
      validationErrors.newPassword = '신규 비밀번호를 입력해 주세요.';
    } else if (newPassword.length < 8) {
      validationErrors.newPassword = '신규 비밀번호는 8자 이상이어야 합니다.';
    }
    if (!newPasswordConfirm) {
      validationErrors.newPasswordConfirm = '신규 비밀번호 확인을 입력해 주세요.';
    } else if (newPassword !== newPasswordConfirm) {
      validationErrors.newPasswordConfirm = '신규 비밀번호와 확인 비밀번호가 일치하지 않습니다.';
    }
    if (currentPassword && newPassword && currentPassword === newPassword && !validationErrors.newPassword) {
      validationErrors.newPassword = '현재 비밀번호와 다른 신규 비밀번호를 입력해 주세요.';
    }
    if (Object.keys(validationErrors).length > 0) {
      setPasswordErrors(validationErrors);
      return;
    }

    setPasswordErrors({});
    setIsPending(true);
    try {
      const response = await UserClient.changeRequiredPassword({
        loginId,
        currentPassword,
        newPassword,
      });
      if (response?.status !== 200) {
        ToastUtil.error(
          '비밀번호 변경',
          response?.data?.detail ?? '현재 비밀번호를 확인하거나 신규 비밀번호를 다시 입력해 주세요.'
        );
        return;
      }

      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirm('');
      setPasswordErrors({});
      ToastUtil.success('비밀번호 변경 완료', '새 비밀번호로 다시 로그인해 주세요.');
      onSuccess?.();
    } catch (error) {
      console.error(error);
      ToastUtil.error(
        '비밀번호 변경',
        error?.response?.data?.detail ?? '현재 비밀번호를 확인하거나 신규 비밀번호를 다시 입력해 주세요.'
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Modal isOpen>
      <Modal.Backdrop className="z-49">
        <Modal.Container size="sm">
          <Modal.Dialog className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-md">
            <Modal.Header className="pb-2">
              <Modal.Heading className="text-xl font-bold">비밀번호를 변경해 주세요</Modal.Heading>
            </Modal.Header>
            <Form onSubmit={changePassword} validationErrors={passwordErrors}>
              <Modal.Body className="flex flex-col gap-4 pt-2">
                <p className="text-sm text-muted">
                  관리자가 비밀번호를 초기화했습니다. 새로운 비밀번호로 변경한 뒤 다시 로그인해 주세요.
                </p>
                <TextField name="currentPassword" isRequired>
                  <Label className="text-base">현재 비밀번호 (임시 비밀번호)</Label>
                  <Input
                    className="ring-1 focus:ring-2 ring-neutral-200 focus:ring-accent"
                    type="password"
                    value={currentPassword}
                    onChange={(event) => {
                      clearPasswordError('currentPassword');
                      setCurrentPassword(event.target.value);
                    }}
                    autoComplete="current-password"
                  />
                  <FieldError>{passwordErrors.currentPassword ?? '현재 비밀번호를 입력해 주세요.'}</FieldError>
                </TextField>
                <TextField name="newPassword" isRequired>
                  <Label className="text-base">신규 비밀번호</Label>
                  <Input
                    className="ring-1 focus:ring-2 ring-neutral-200 focus:ring-accent"
                    type="password"
                    value={newPassword}
                    onChange={(event) => {
                      clearPasswordError('newPassword');
                      clearPasswordError('newPasswordConfirm');
                      setNewPassword(event.target.value);
                    }}
                    autoComplete="new-password"
                  />
                  <FieldError>{passwordErrors.newPassword ?? '신규 비밀번호는 8자 이상이어야 합니다.'}</FieldError>
                </TextField>
                <TextField name="newPasswordConfirm" isRequired>
                  <Label className="text-base">신규 비밀번호 확인</Label>
                  <Input
                    className="ring-1 focus:ring-2 ring-neutral-200 focus:ring-accent"
                    type="password"
                    value={newPasswordConfirm}
                    onChange={(event) => {
                      clearPasswordError('newPasswordConfirm');
                      setNewPasswordConfirm(event.target.value);
                    }}
                    autoComplete="new-password"
                  />
                  <FieldError>{passwordErrors.newPasswordConfirm ?? '신규 비밀번호 확인을 입력해 주세요.'}</FieldError>
                </TextField>
              </Modal.Body>
              <Modal.Footer className="flex flex-col gap-2 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row">
                {typeof onClose === 'function' && (
                  <Button type="button" variant="secondary" className="min-h-11 w-full" onPress={onClose}>
                    취소
                  </Button>
                )}
                <Button type="submit" isPending={isPending} className="min-h-11 w-full">
                  변경하기
                </Button>
              </Modal.Footer>
            </Form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
