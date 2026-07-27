import { Button, Chip, FieldError, Form, Input, Label, Modal, Skeleton, TextField } from '@heroui/react';
import { useEffect, useState } from 'react';
import FormSection from '../common/FormSection.jsx';
import { UserClient } from '../../api/user/index.js';
import { ToastUtil } from '../../util/toastUtil.js';
import { DateUtil } from '../../util/dateUtil.jsx';
import { useUserStore } from '../../store/user.jsx';

const roleLabels = {
  SUPER: '슈퍼유저',
  SITE_ADMIN: '사이트 관리자',
  USER: '일반 사용자',
};

const statusConfig = {
  PENDING: { label: '승인 대기', color: 'warning' },
  ACTIVE: { label: '활성', color: 'success' },
  DISABLED: { label: '비활성', color: 'default' },
  REJECTED: { label: '반려', color: 'danger' },
};

export default function MyPageForm() {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isProfileSubmitLoading, setIsProfileSubmitLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [account, setAccount] = useState({});
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', newPasswordConfirm: '' });
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    const loadAccount = async () => {
      try {
        const response = await UserClient.me();
        if (response?.status !== 200) throw new Error('Failed to load account');
        setAccount(response.data ?? {});
        setUser(response.data ?? {});
      } catch (error) {
        console.error(error);
        ToastUtil.error('내 계정', '계정 정보를 불러오지 못했습니다.');
      } finally {
        setIsPageLoading(false);
      }
    };
    loadAccount();
  }, [setUser]);

  const updatePassword = (key) => (event) => {
    setPasswords((current) => ({ ...current, [key]: event.target.value }));
    setPasswordErrors((current) => {
      const keys = key === 'newPassword' ? [key, 'newPasswordConfirm'] : [key];
      if (!keys.some((errorKey) => current[errorKey])) return current;
      const next = { ...current };
      keys.forEach((errorKey) => delete next[errorKey]);
      return next;
    });
  };

  const updateAccount = (key) => (event) => {
    setAccount((current) => ({ ...current, [key]: event.target.value }));
    if (key === 'userEmail' || key === 'username') {
      setProfileErrors((current) => {
        if (!current[key]) return current;
        const next = { ...current };
        delete next[key];
        return next;
      });
    }
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = {};
    if (!account.username?.trim()) {
      validationErrors.username = '이름을 입력해 주세요.';
    }
    if (!account.userEmail?.trim()) {
      validationErrors.userEmail = '이메일을 입력해 주세요.';
    }
    if (Object.keys(validationErrors).length > 0) {
      setProfileErrors(validationErrors);
      return;
    }

    setProfileErrors({});
    setIsProfileSubmitLoading(true);
    try {
      const response = await UserClient.updateMyProfile({
        username: account.username.trim(),
        userEmail: account.userEmail.trim(),
        phoneNumber: account.phoneNumber?.trim() || null,
      });
      setAccount(response.data);
      setUser(response.data);
      ToastUtil.success('내 정보 저장', '계정 정보를 저장했습니다.');
    } catch (error) {
      console.error(error);
      ToastUtil.error('내 정보 저장', error?.response?.data?.detail ?? '계정 정보를 저장하지 못했습니다.');
    } finally {
      setIsProfileSubmitLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { currentPassword, newPassword, newPasswordConfirm } = passwords;

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
      validationErrors.newPassword = '신규 비밀번호는 현재 비밀번호와 달라야 합니다.';
    }

    if (Object.keys(validationErrors).length > 0) {
      setPasswordErrors(validationErrors);
      return;
    }

    setPasswordErrors({});

    setIsSubmitLoading(true);
    try {
      const response = await UserClient.changeMyPassword({ currentPassword, newPassword });
      if (response?.status !== 200) throw new Error('Failed to change password');
      setAccount(response.data ?? {});
      setUser(response.data ?? {});
      setPasswords({ currentPassword: '', newPassword: '', newPasswordConfirm: '' });
      setIsPasswordDialogOpen(false);
      setPasswordErrors({});
      ToastUtil.success('비밀번호 변경', '비밀번호를 변경했습니다.');
    } catch (error) {
      console.error(error);
      ToastUtil.error('비밀번호 변경', error?.response?.data?.message ?? '비밀번호 변경에 실패했습니다.');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const status = statusConfig[account.accountStatus] ?? { label: account.accountStatus, color: 'default' };
  const site = account.siteName ? `${account.siteName} (${account.siteId ?? ''})` : (account.siteId ?? '');

  const statusContent = (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between max-w-2xl">
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <Chip color={status.color} variant="soft" size="lg">
            {status.label}
          </Chip>
          <div>
            <p className="text-sm text-muted">
              신청일자: {account.createdAt ? DateUtil.timestampToDateTime(account.createdAt) : '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col">
      <div className="relative w-full flex flex-col gap-4">
        <FormSection title="계정 상태">
          {isPageLoading ? <Skeleton className="h-18 w-full max-w-2xl rounded-lg" /> : statusContent}
        </FormSection>

        <FormSection title="비밀번호">
          {isPageLoading ? (
            <Skeleton className="h-10 w-36 rounded-lg" />
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button variant="secondary" onPress={() => setIsPasswordDialogOpen(true)}>
                비밀번호 변경
              </Button>
            </div>
          )}
        </FormSection>

        <FormSection title="계정 정보">
          {isPageLoading ? (
            <div className="flex flex-col gap-6">
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton key={index} className="h-18 w-full max-w-2xl rounded-lg" />
              ))}
            </div>
          ) : (
            <Form
              id="my-profile-form"
              className="flex w-full flex-col gap-6"
              onSubmit={handleProfileSubmit}
              validationErrors={profileErrors}
            >
              <TextField className="w-full max-w-2xl" isReadOnly variant="default">
                <Label className="text-base">사용자 ID</Label>
                <Input className="ring-1 focus:ring-2 ring-neutral-200 bg-neutral-100" value={account.userId ?? ''} />
              </TextField>
              <TextField name="userEmail" className="w-full max-w-2xl" isRequired type="email">
                <Label className="text-base">이메일</Label>
                <Input
                  className="ring-1 focus:ring-2 ring-neutral-200 focus:ring-accent"
                  value={account.userEmail ?? ''}
                  onChange={updateAccount('userEmail')}
                />
                <FieldError>이메일을 입력해 주세요.</FieldError>
              </TextField>
              <TextField name="username" className="w-full max-w-2xl" isRequired>
                <Label className="text-base">이름</Label>
                <Input
                  className="ring-1 focus:ring-2 ring-neutral-200 focus:ring-accent"
                  value={account.username ?? ''}
                  onChange={updateAccount('username')}
                />
                <FieldError>이름을 입력해 주세요.</FieldError>
              </TextField>
              <TextField className="w-full max-w-2xl" isReadOnly variant="default">
                <Label className="text-base">사이트</Label>
                <Input className="ring-1 focus:ring-2 ring-neutral-200 bg-neutral-100" value={site} />
              </TextField>
              <TextField className="w-full max-w-2xl" isReadOnly variant="default">
                <Label className="text-base">역할</Label>
                <Input
                  className="ring-1 focus:ring-2 ring-neutral-200 bg-neutral-100"
                  value={roleLabels[account.userRole] ?? account.userRole ?? ''}
                />
              </TextField>
            </Form>
          )}
        </FormSection>

        {!isPageLoading && (
          <div className="bottom-2 sticky mt-4 w-full bg-white rounded-xl z-20">
            <Button
              size="lg"
              className="h-10 rounded-2xl"
              type="submit"
              form="my-profile-form"
              isPending={isProfileSubmitLoading}
              fullWidth
            >
              저장하기
            </Button>
          </div>
        )}
      </div>
      <Modal isOpen={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <Modal.Backdrop className="z-49">
          <Modal.Container size="sm">
            <Modal.Dialog>
              <Modal.CloseTrigger />
              <Modal.Header className="pb-2">
                <Modal.Heading className="text-xl font-bold">비밀번호 변경</Modal.Heading>
              </Modal.Header>
              <Form onSubmit={handleSubmit} validationErrors={passwordErrors}>
                <Modal.Body className="flex flex-col gap-5 pt-2">
                  <TextField name="currentPassword" className="w-full" isRequired>
                    <Label className="text-base">현재 비밀번호</Label>
                    <Input
                      name="currentPassword"
                      value={passwords.currentPassword}
                      onChange={updatePassword('currentPassword')}
                      className="ring-1 focus:ring-2 ring-neutral-200 focus:ring-accent"
                      type="password"
                      autoComplete="current-password"
                    />
                    <FieldError>{passwordErrors.currentPassword ?? '현재 비밀번호를 입력해 주세요.'}</FieldError>
                  </TextField>
                  <TextField name="newPassword" className="w-full" isRequired>
                    <Label className="text-base">신규 비밀번호</Label>
                    <Input
                      name="newPassword"
                      value={passwords.newPassword}
                      onChange={updatePassword('newPassword')}
                      className="ring-1 focus:ring-2 ring-neutral-200 focus:ring-accent"
                      type="password"
                      autoComplete="new-password"
                    />
                    <FieldError>{passwordErrors.newPassword ?? '신규 비밀번호는 8자 이상이어야 합니다.'}</FieldError>
                  </TextField>
                  <TextField name="newPasswordConfirm" className="w-full" isRequired>
                    <Label className="text-base">신규 비밀번호 확인</Label>
                    <Input
                      name="newPasswordConfirm"
                      value={passwords.newPasswordConfirm}
                      onChange={updatePassword('newPasswordConfirm')}
                      className="ring-1 focus:ring-2 ring-neutral-200 focus:ring-accent"
                      type="password"
                      autoComplete="new-password"
                    />
                    <FieldError>
                      {passwordErrors.newPasswordConfirm ?? '신규 비밀번호 확인을 입력해 주세요.'}
                    </FieldError>
                  </TextField>
                </Modal.Body>
                <Modal.Footer>
                  <Button slot="close" variant="tertiary">
                    취소
                  </Button>
                  <Button type="submit" isPending={isSubmitLoading}>
                    변경하기
                  </Button>
                </Modal.Footer>
              </Form>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}
