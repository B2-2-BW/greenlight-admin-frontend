import {
  Button,
  Chip,
  FieldError,
  Form,
  Input,
  Label,
  ListBox,
  Modal,
  Select,
  Skeleton,
  Surface,
  TextField,
} from '@heroui/react';
import { ArrowLeft } from '@gravity-ui/icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { UserClient } from '../api/user/index.js';
import { SiteClient } from '../api/site/index.js';
import ConfirmAlertDialog from '../component/ConfirmAlertDialog.jsx';
import FormSection from '../component/common/FormSection.jsx';
import { ToastUtil } from '../util/toastUtil.js';
import { DateUtil } from '../util/dateUtil.jsx';
import { useUserStore } from '../store/user.jsx';

const roleLabels = {
  SUPER: '슈퍼유저',
  SITE_ADMIN: '사이트 관리자',
  USER: '일반 사용자',
};

const statusConfig = {
  PENDING: { label: '승인 대기', color: 'warning' },
  ACTIVE: { label: '활성', color: 'success' },
  REJECTED: { label: '반려', color: 'danger' },
  DISABLED: { label: '비활성', color: 'default' },
};

function ReadonlyField({ label, value }) {
  return (
    <TextField className="w-full max-w-2xl" isReadOnly variant="default">
      <Label className="text-base">{label}</Label>
      <Input className="ring-1 focus:ring-2 ring-neutral-200 bg-neutral-100" value={value ?? ''} />
    </TextField>
  );
}

function SectionSkeleton({ rows = 2 }) {
  return (
    <div className="flex flex-col gap-6">
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-18 w-full max-w-2xl rounded-lg" />
      ))}
    </div>
  );
}

export default function UserDetailPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [dialogAction, setDialogAction] = useState(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState({});
  const approvalFormRef = useRef(null);
  const currentUser = useUserStore((state) => state.user);
  const currentUserId = currentUser?.userId;
  const currentSiteId = currentUser?.siteId ?? currentUser?.userSiteId;
  const [approval, setApproval] = useState({ username: '', userEmail: '', siteId: '', userRole: 'USER' });
  const [sites, setSites] = useState([]);
  const [isSitesLoading, setIsSitesLoading] = useState(false);
  const [management, setManagement] = useState({ username: '', userEmail: '', siteId: '', userRole: 'USER' });

  const fetchUser = useCallback(async () => {
    try {
      const response = await UserClient.getUser(userId);
      setUser(response.data);
      if (response.data.accountStatus === 'PENDING') {
        setApproval({
          username: response.data.username ?? '',
          userEmail: response.data.userEmail ?? '',
          siteId: response.data.siteId ?? '',
          userRole: response.data.userRole ?? 'USER',
        });
      } else if (response.data.accountStatus === 'ACTIVE' || response.data.accountStatus === 'DISABLED') {
        setManagement({
          username: response.data.username ?? '',
          userEmail: response.data.userEmail ?? '',
          siteId: response.data.siteId ?? '',
          userRole: response.data.userRole ?? 'USER',
        });
      }
    } catch (error) {
      console.error(error);
      ToastUtil.error('사용자 상세', '사용자 정보를 불러오지 못했습니다.');
    } finally {
      setIsPageLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    setIsPageLoading(true);
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!user || !['PENDING', 'ACTIVE', 'DISABLED'].includes(user.accountStatus)) return;
    if (currentUser?.userRole === 'SITE_ADMIN') {
      setSites([{ siteId: currentSiteId, siteName: currentUser.siteName ?? currentSiteId }]);
      if (user.accountStatus === 'PENDING') {
        setApproval((current) => ({ ...current, siteId: currentSiteId }));
      } else {
        setManagement((current) => ({ ...current, siteId: currentSiteId }));
      }
      return;
    }
    if (currentUser?.userRole !== 'SUPER') return;

    const controller = new AbortController();
    let cancelled = false;
    const loadSites = async () => {
      setIsSitesLoading(true);
      try {
        const firstResponse = await SiteClient.getSites({ page: 1, size: 100, signal: controller.signal });
        const firstPage = firstResponse.data ?? {};
        const remainingResponses = await Promise.all(
          Array.from({ length: Math.max(0, (firstPage.totalPages ?? 1) - 1) }, (_, index) =>
            SiteClient.getSites({ page: index + 2, size: 100, signal: controller.signal })
          )
        );
        if (!cancelled) {
          setSites([
            ...(firstPage.content ?? []),
            ...remainingResponses.flatMap((response) => response.data?.content ?? []),
          ]);
        }
      } catch (error) {
        if (error.code === 'ERR_CANCELED') return;
        console.error(error);
        ToastUtil.error('사이트 목록', '사이트 목록을 불러오지 못했습니다.');
      } finally {
        if (!cancelled) setIsSitesLoading(false);
      }
    };
    loadSites();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [currentSiteId, currentUser?.siteName, currentUser?.userRole, user]);

  const changeStatus = async (accountStatus) => {
    setIsActionLoading(true);
    try {
      const response = await UserClient.updateUserStatus(userId, accountStatus);
      setUser(response.data);
      if (response.data?.accountStatus === 'PENDING') {
        setApproval({
          username: response.data.username ?? '',
          userEmail: response.data.userEmail ?? '',
          siteId: response.data.siteId ?? '',
          userRole: response.data.userRole ?? 'USER',
        });
      }
      ToastUtil.success('계정 상태 변경', '계정 상태를 변경했습니다.');
    } catch (error) {
      console.error(error);
      ToastUtil.error('계정 상태 변경', error.response?.data?.detail ?? '계정 상태를 변경하지 못했습니다.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const approveUser = async () => {
    if (!approvalFormRef.current?.checkValidity()) {
      setDialogAction(null);
      approvalFormRef.current?.reportValidity();
      return;
    }
    setIsActionLoading(true);
    try {
      const response = await UserClient.approveUser(userId, {
        ...approval,
        username: approval.username.trim(),
        userEmail: approval.userEmail.trim(),
      });
      setUser(response.data);
      setManagement({
        username: response.data.username ?? '',
        userEmail: response.data.userEmail ?? '',
        siteId: response.data.siteId ?? '',
        userRole: response.data.userRole ?? 'USER',
      });
      setDialogAction(null);
      ToastUtil.success('가입 승인', '가입 정보를 확인하고 계정을 승인했습니다.');
    } catch (error) {
      console.error(error);
      ToastUtil.error('가입 승인', error.response?.data?.detail ?? '가입 정보를 확인하고 승인하지 못했습니다.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const updateManagedUser = async (event) => {
    event.preventDefault();
    setIsActionLoading(true);
    try {
      const response = await UserClient.updateManagedUser(userId, {
        ...management,
        username: management.username.trim(),
        userEmail: management.userEmail.trim(),
      });
      setUser(response.data);
      setManagement({
        username: response.data.username ?? '',
        userEmail: response.data.userEmail ?? '',
        siteId: response.data.siteId ?? '',
        userRole: response.data.userRole ?? 'USER',
      });
      ToastUtil.success('계정 정보 저장', '계정 정보를 저장했습니다.');
    } catch (error) {
      console.error(error);
      ToastUtil.error('계정 정보 저장', error.response?.data?.detail ?? '계정 정보를 저장하지 못했습니다.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const openApprovalDialog = (event) => {
    event.preventDefault();
    setDialogAction('approve');
  };

  const handleApprovalDialogOpenChange = (open) => {
    if (!open) {
      setDialogAction(null);
      return;
    }
    approvalFormRef.current?.requestSubmit();
  };

  const resetPassword = async (event) => {
    event.preventDefault();

    const validationErrors = {};
    if (!newPassword) {
      validationErrors.newPassword = '신규 비밀번호를 입력해 주세요.';
    } else if (newPassword.length < 8) {
      validationErrors.newPassword = '신규 비밀번호는 8자 이상이어야 합니다.';
    }
    if (Object.keys(validationErrors).length > 0) {
      setPasswordErrors(validationErrors);
      return;
    }

    setPasswordErrors({});
    setIsActionLoading(true);
    try {
      const response = await UserClient.resetUserPassword(userId, { newPassword });
      setUser(response.data ?? user);
      setNewPassword('');
      setIsPasswordDialogOpen(false);
      setPasswordErrors({});
      ToastUtil.success('비밀번호 초기화', '신규 비밀번호를 설정했습니다. 다음 로그인에서 비밀번호 변경이 필요합니다.');
    } catch (error) {
      console.error(error);
      ToastUtil.error('비밀번호 초기화', error.response?.data?.detail ?? '비밀번호를 초기화하지 못했습니다.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const status = statusConfig[user?.accountStatus] ?? { label: user?.accountStatus, color: 'default' };
  const isSuperUserReadOnly = currentUser?.userRole === 'SITE_ADMIN' && user?.userRole === 'SUPER';
  const canManageTarget = user?.userId !== currentUserId && !isSuperUserReadOnly;
  const canSaveManagedUser = ['ACTIVE', 'DISABLED'].includes(user?.accountStatus) && !isSuperUserReadOnly;

  const statusContent = (
    <div className="flex max-w-2xl flex-col gap-5">
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <Chip color={status.color} variant="soft" size="lg">
            {status.label}
          </Chip>
          <div>
            <p className="text-sm text-muted">
              신청일자: {user?.createdAt ? DateUtil.timestampToDateTime(user.createdAt) : '-'}
            </p>
          </div>
        </div>
        {user?.userId === currentUserId && <p className="text-sm text-muted">본인 계정 상태는 변경할 수 없습니다.</p>}
      </div>
      {canManageTarget && user?.accountStatus && user?.accountStatus !== 'PENDING' && (
        <div className="flex shrink-0 flex-wrap justify-start gap-2">
          {user.accountStatus === 'ACTIVE' && (
            <ConfirmAlertDialog
              title="계정을 비활성화할까요?"
              message="비활성화된 계정은 새로 로그인하거나 토큰을 갱신할 수 없습니다."
              confirmMessage="비활성화"
              isOpen={dialogAction === 'disable'}
              onOpenChange={(open) => setDialogAction(open ? 'disable' : null)}
              onConfirm={() => changeStatus('DISABLED')}
            >
              <Button variant="danger-soft" isDisabled={isActionLoading} className="min-h-11 w-full sm:w-auto">
                계정 비활성화
              </Button>
            </ConfirmAlertDialog>
          )}
          {user.accountStatus === 'DISABLED' && (
            <ConfirmAlertDialog
              title="계정을 활성화할까요?"
              message="활성화 즉시 사용자가 로그인할 수 있습니다."
              confirmMessage="활성화"
              isOpen={dialogAction === 'activate'}
              onOpenChange={(open) => setDialogAction(open ? 'activate' : null)}
              onConfirm={() => changeStatus('ACTIVE')}
            >
              <Button isDisabled={isActionLoading} className="min-h-11 w-full sm:w-auto">계정 활성화</Button>
            </ConfirmAlertDialog>
          )}
          {user.accountStatus === 'REJECTED' && (
            <ConfirmAlertDialog
              title="가입 신청을 다시 검토할까요?"
              message="승인 대기 상태로 변경한 뒤 가입 정보와 역할을 다시 확인해야 합니다."
              confirmMessage="승인 재검토"
              isOpen={dialogAction === 'review'}
              onOpenChange={(open) => setDialogAction(open ? 'review' : null)}
              onConfirm={() => changeStatus('PENDING')}
            >
              <Button isDisabled={isActionLoading} className="min-h-11 w-full sm:w-auto">승인 재검토</Button>
            </ConfirmAlertDialog>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full bg-neutral-50">
      <div className="max-w-[1080px] p-4 sm:p-6">
        <header className="mb-4 mt-4 flex items-center justify-between gap-4 sm:mt-8">
          {isPageLoading ? (
            <Skeleton className="h-10 w-64 rounded-lg" />
          ) : (
            <div className="flex items-baseline gap-2">
              <h1 className="text-2xl font-bold sm:text-3xl">사용자 상세</h1>
            </div>
          )}
          <Button
            size="lg"
            isIconOnly
            variant="ghost"
            onPress={() => navigate('/users')}
            aria-label="사용자 목록으로 돌아가기"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </header>

        {isPageLoading ? (
          <>
            <FormSection title="계정 상태">
              <SectionSkeleton rows={1} />
            </FormSection>
            <FormSection title="비밀번호 초기화">
              <SectionSkeleton rows={2} />
            </FormSection>
            <FormSection title="계정 정보">
              <SectionSkeleton rows={5} />
            </FormSection>
          </>
        ) : !user ? (
          <Surface className="rounded-3xl p-8 text-center">사용자 정보를 찾을 수 없습니다.</Surface>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted">
              {user.accountStatus === 'PENDING'
                ? '계정 상태와 가입 정보를 관리합니다.'
                : '계정 상태와 비밀번호 초기화를 관리합니다.'}
            </p>
            {user.accountStatus !== 'PENDING' && <FormSection title="계정 상태">{statusContent}</FormSection>}

            {canManageTarget && user.accountStatus !== 'PENDING' && (
              <FormSection title="비밀번호 초기화">
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-muted">
                    새로운 비밀번호를 설정합니다. 사용자는 이 비밀번호로 로그인한 뒤 반드시 비밀번호를 변경해야 합니다.
                  </p>
                  <Button
                    variant="secondary"
                    className="min-h-11 w-full sm:w-fit"
                    isDisabled={isActionLoading}
                    onPress={() => setIsPasswordDialogOpen(true)}
                  >
                    비밀번호 초기화
                  </Button>
                  <Modal isOpen={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                    <Modal.Backdrop className="z-49">
                      <Modal.Container size="sm">
                        <Modal.Dialog className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-md">
                          <Modal.CloseTrigger />
                          <Modal.Header>
                            <Modal.Heading>비밀번호 초기화</Modal.Heading>
                          </Modal.Header>
                          <Form onSubmit={resetPassword} validationErrors={passwordErrors}>
                            <Modal.Body className="flex flex-col gap-4">
                              <p className="text-sm text-muted">기존 비밀번호는 즉시 사용할 수 없게 됩니다.</p>
                              <TextField name="newPassword" isRequired className="w-full max-w-2xl" variant="default">
                                <Label className="text-base">신규 비밀번호</Label>
                                <Input
                                  className="ring-1 focus:ring-2 ring-neutral-200 focus:ring-accent"
                                  type="password"
                                  value={newPassword}
                                  onChange={(event) => {
                                    setPasswordErrors((current) => {
                                      if (!current.newPassword) return current;
                                      const next = { ...current };
                                      delete next.newPassword;
                                      return next;
                                    });
                                    setNewPassword(event.target.value);
                                  }}
                                  autoComplete="new-password"
                                />
                                <FieldError>
                                  {passwordErrors.newPassword ?? '신규 비밀번호는 8자 이상이어야 합니다.'}
                                </FieldError>
                              </TextField>
                            </Modal.Body>
                            <Modal.Footer className="flex-col-reverse gap-2 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end">
                              <Button slot="close" variant="tertiary" className="min-h-11 w-full sm:w-auto">
                                취소
                              </Button>
                              <Button type="submit" isPending={isActionLoading} className="min-h-11 w-full sm:w-auto">
                                비밀번호 설정
                              </Button>
                            </Modal.Footer>
                          </Form>
                        </Modal.Dialog>
                      </Modal.Container>
                    </Modal.Backdrop>
                  </Modal>
                </div>
              </FormSection>
            )}

            <FormSection title={user.accountStatus === 'PENDING' ? '가입 정보 검토' : '계정 정보'}>
              <div className="flex w-full flex-col gap-6">
                {user.accountStatus === 'PENDING' && (
                  <div className="border-b border-neutral-200 pb-6">{statusContent}</div>
                )}
                <ReadonlyField label="사용자 ID" value={user.userId} />
                {user.accountStatus === 'PENDING' && !isSuperUserReadOnly ? (
                  <Form
                    ref={approvalFormRef}
                    onSubmit={openApprovalDialog}
                    className="flex w-full flex-col gap-6"
                  >
                    <TextField
                      name="username"
                      isRequired
                      validate={(value) => (value.trim() ? null : '이름을 입력해 주세요.')}
                      className="w-full max-w-2xl"
                      variant="default"
                    >
                      <Label className="text-base">이름</Label>
                      <Input
                        className="ring-1 focus:ring-2 ring-neutral-200 focus:ring-accent"
                        value={approval.username}
                        onChange={(event) => setApproval((current) => ({ ...current, username: event.target.value }))}
                      />
                      <FieldError>이름을 입력해 주세요.</FieldError>
                    </TextField>
                    <TextField
                      name="userEmail"
                      type="email"
                      isRequired
                      className="w-full max-w-2xl"
                      variant="default"
                    >
                      <Label className="text-base">이메일</Label>
                      <Input
                        className="ring-1 focus:ring-2 ring-neutral-200 focus:ring-accent"
                        value={approval.userEmail}
                        onChange={(event) => setApproval((current) => ({ ...current, userEmail: event.target.value }))}
                      />
                      <FieldError>올바른 이메일을 입력해 주세요.</FieldError>
                    </TextField>
                    <Select
                      name="siteId"
                      isRequired
                      className="w-full max-w-2xl"
                      aria-label="사이트"
                      value={approval.siteId}
                      onChange={(siteId) => setApproval((current) => ({ ...current, siteId }))}
                      isDisabled={isSitesLoading || currentUser?.userRole === 'SITE_ADMIN'}
                    >
                      <Label className="text-base">사이트</Label>
                      <Select.Trigger className="min-h-11 w-full items-center ring-1 focus:ring-2 ring-neutral-200 focus:ring-accent sm:max-w-64">
                        <Select.Value>
                          {({ state }) =>
                            isSitesLoading
                              ? '사이트를 불러오는 중...'
                              : (state.selectedItems[0]?.textValue ?? '사이트 선택')
                          }
                        </Select.Value>
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover className="max-w-[calc(100vw-2rem)] w-64" placement="bottom start">
                        <ListBox>
                          {sites.map((site) => (
                            <ListBox.Item
                              key={site.siteId}
                              id={site.siteId}
                              textValue={`${site.siteName} (${site.siteId})`}
                            >
                              <ListBox.ItemIndicator />
                              {site.siteName} ({site.siteId})
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                      <FieldError>사이트를 선택해 주세요.</FieldError>
                    </Select>
                    <Select
                      name="userRole"
                      isRequired
                      className="w-full max-w-2xl"
                      aria-label="역할"
                      value={approval.userRole}
                      onChange={(userRole) => setApproval((current) => ({ ...current, userRole }))}
                    >
                      <Label className="text-base">역할</Label>
                      <Select.Trigger className="min-h-11 w-full items-center ring-1 focus:ring-2 ring-neutral-200 focus:ring-accent sm:max-w-64">
                        <Select.Value>{({ state }) => state.selectedItems[0]?.textValue ?? '역할 선택'}</Select.Value>
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover className="max-w-[calc(100vw-2rem)] w-64" placement="bottom start">
                        <ListBox>
                          {(currentUser?.userRole === 'SUPER'
                            ? ['USER', 'SITE_ADMIN', 'SUPER']
                            : ['USER', 'SITE_ADMIN']
                          ).map((role) => (
                            <ListBox.Item key={role} id={role} textValue={roleLabels[role]}>
                              <ListBox.ItemIndicator />
                              {roleLabels[role]}
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                      <FieldError>역할을 선택해 주세요.</FieldError>
                    </Select>
                    {canManageTarget && (
                      <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:flex-wrap">
                        <ConfirmAlertDialog
                          title="가입을 승인할까요?"
                          message={`사이트: ${sites.find((site) => site.siteId === approval.siteId)?.siteName ?? approval.siteId} (${approval.siteId}) · 역할: ${roleLabels[approval.userRole] ?? approval.userRole}`}
                          confirmMessage="가입 승인"
                          isOpen={dialogAction === 'approve'}
                          onOpenChange={handleApprovalDialogOpenChange}
                          onConfirm={approveUser}
                        >
                          <Button type="button" isDisabled={isActionLoading} className="min-h-11 w-full sm:w-auto">
                            가입 승인
                          </Button>
                        </ConfirmAlertDialog>
                        <ConfirmAlertDialog
                          title="가입 신청을 반려할까요?"
                          message="반려된 계정은 로그인할 수 없습니다."
                          confirmMessage="반려"
                          isOpen={dialogAction === 'reject'}
                          onOpenChange={(open) => setDialogAction(open ? 'reject' : null)}
                          onConfirm={() => changeStatus('REJECTED')}
                        >
                          <Button variant="danger-soft" isDisabled={isActionLoading} className="min-h-11 w-full sm:w-auto">
                            가입 반려
                          </Button>
                        </ConfirmAlertDialog>
                      </div>
                    )}
                  </Form>
                ) : ['ACTIVE', 'DISABLED'].includes(user.accountStatus) && !isSuperUserReadOnly ? (
                  <>
                    <Form id="managed-user-form" onSubmit={updateManagedUser} className="flex w-full flex-col gap-6">
                      <TextField
                        name="username"
                        isRequired
                        validate={(value) => (value.trim() ? null : '이름을 입력해 주세요.')}
                        className="w-full max-w-2xl"
                        variant="default"
                      >
                        <Label className="text-base">이름</Label>
                        <Input
                          className="ring-1 focus:ring-2 ring-neutral-200 focus:ring-accent"
                          value={management.username}
                          onChange={(event) =>
                            setManagement((current) => ({ ...current, username: event.target.value }))
                          }
                        />
                        <FieldError>이름을 입력해 주세요.</FieldError>
                      </TextField>
                      <TextField
                        name="userEmail"
                        type="email"
                        isRequired
                        className="w-full max-w-2xl"
                        variant="default"
                      >
                        <Label className="text-base">이메일</Label>
                        <Input
                          className="ring-1 focus:ring-2 ring-neutral-200 focus:ring-accent"
                          value={management.userEmail}
                          onChange={(event) =>
                            setManagement((current) => ({ ...current, userEmail: event.target.value }))
                          }
                        />
                        <FieldError>올바른 이메일을 입력해 주세요.</FieldError>
                      </TextField>
                      <Select
                        name="siteId"
                        isRequired
                        className="w-full max-w-2xl"
                        aria-label="사이트"
                        value={management.siteId}
                        onChange={(siteId) => setManagement((current) => ({ ...current, siteId }))}
                        isDisabled={
                          isSitesLoading || user.userId === currentUserId || currentUser?.userRole === 'SITE_ADMIN'
                        }
                      >
                        <Label className="text-base">사이트</Label>
                        <Select.Trigger className="min-h-11 w-full items-center ring-1 focus:ring-2 ring-neutral-200 focus:ring-accent sm:w-64">
                          <Select.Value>
                            {({ state }) =>
                              isSitesLoading
                                ? '사이트를 불러오는 중...'
                                : (state.selectedItems[0]?.textValue ?? '사이트 선택')
                            }
                          </Select.Value>
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover className="max-w-[calc(100vw-2rem)] w-64" placement="bottom start">
                          <ListBox>
                            {sites.map((site) => (
                              <ListBox.Item
                                key={site.siteId}
                                id={site.siteId}
                                textValue={`${site.siteName} (${site.siteId})`}
                              >
                                <ListBox.ItemIndicator />
                                {site.siteName} ({site.siteId})
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                        <FieldError>사이트를 선택해 주세요.</FieldError>
                      </Select>
                      <Select
                        name="userRole"
                        isRequired
                        className="w-full max-w-2xl"
                        aria-label="역할"
                        value={management.userRole}
                        onChange={(userRole) => setManagement((current) => ({ ...current, userRole }))}
                        isDisabled={user.userId === currentUserId}
                      >
                        <Label className="text-base">역할</Label>
                        <Select.Trigger className="min-h-11 w-full items-center ring-1 focus:ring-2 ring-neutral-200 focus:ring-accent sm:max-w-64">
                          <Select.Value>
                            {({ state }) => state.selectedItems[0]?.textValue ?? '역할 선택'}
                          </Select.Value>
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover className="max-w-[calc(100vw-2rem)] w-64" placement="bottom start">
                          <ListBox>
                            {(currentUser?.userRole === 'SUPER'
                              ? ['USER', 'SITE_ADMIN', 'SUPER']
                              : ['USER', 'SITE_ADMIN']
                            ).map((role) => (
                              <ListBox.Item key={role} id={role} textValue={roleLabels[role]}>
                                <ListBox.ItemIndicator />
                                {roleLabels[role]}
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                        <FieldError>역할을 선택해 주세요.</FieldError>
                      </Select>
                    </Form>
                  </>
                ) : (
                  <>
                    <ReadonlyField label="이름" value={user.username} />
                    <ReadonlyField label="이메일" value={user.userEmail} />
                    <ReadonlyField label="사이트" value={`${user.siteName ?? ''} (${user.siteId})`} />
                    <ReadonlyField label="역할" value={roleLabels[user.userRole] ?? user.userRole} />
                  </>
                )}
              </div>
            </FormSection>

            {canSaveManagedUser && (
              <div className="sticky bottom-0 z-20 mt-4 w-full rounded-xl bg-white/95 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur">
                <Button
                  size="lg"
                  className="min-h-11 rounded-2xl"
                  type="submit"
                  form="managed-user-form"
                  isPending={isActionLoading}
                  fullWidth
                >
                  저장하기
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
