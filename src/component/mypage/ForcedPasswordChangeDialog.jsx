import { Button, FieldError, Form, Input, Label, Modal, TextField } from '@heroui/react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { UserClient } from '../../api/user/index.js';
import { useUserStore } from '../../store/user.jsx';
import { ToastUtil } from '../../util/toastUtil.js';

export default function ForcedPasswordChangeDialog() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isPending, setIsPending] = useState(false);

  if (!user?.passwordResetRequired) return null;

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
      const response = await UserClient.changeMyPassword({ currentPassword, newPassword });
      if (response?.status !== 200) {
        ToastUtil.error(
          '비밀번호 변경',
          response?.data?.detail ?? '현재 비밀번호를 확인하거나 신규 비밀번호를 다시 입력해 주세요.'
        );
        return;
      }

      setUser(response.data);
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirm('');
      setPasswordErrors({});
      ToastUtil.success('비밀번호 변경 완료', '새로운 비밀번호로 로그인이 완료되었습니다.');
      navigate('/', { replace: true });
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
                  관리자가 비밀번호를 초기화했습니다. 새로운 비밀번호로 변경해야 로그인 할 수 있습니다.
                </p>
                <TextField name="currentPassword" isRequired>
                  <Label className="text-base">현재 비밀번호</Label>
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
              <Modal.Footer className="pb-[max(1rem,env(safe-area-inset-bottom))]">
                <Button type="submit" isPending={isPending} className="min-h-11 w-full">
                  변경하고 로그인
                </Button>
              </Modal.Footer>
            </Form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
