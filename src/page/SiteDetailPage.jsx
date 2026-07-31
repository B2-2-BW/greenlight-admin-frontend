import {
  Button,
  Description,
  FieldError,
  Form,
  Input,
  Label,
  Modal,
  Skeleton,
  Switch,
  TextArea,
  TextField,
} from '@heroui/react';
import { ArrowLeft, TrashBin } from '@gravity-ui/icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { SiteClient } from '../api/site/index.js';
import { RoomClient } from '../api/room/index.js';
import FormSection from '../component/common/FormSection.jsx';
import ConfirmAlertDialog from '../component/ConfirmAlertDialog.jsx';
import { useUserStore } from '../store/user.jsx';
import { ToastUtil } from '../util/toastUtil.js';
import ChangeDiff from '../component/audit/ChangeDiff.jsx';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges.js';

const fieldClass = 'ring-1 focus:ring-2 ring-neutral-200 focus:ring-accent';
const enabledMessage = {
  true: {
    title: '사이트 활성화',
    subtitle: '사이트와 소속 계정이 서비스를 사용할 수 있습니다.',
  },
  false: {
    title: '사이트 비활성화',
    subtitle: '서비스 이용만 제한되며 소속 계정과 대기열의 개별 활성 상태는 유지됩니다.',
  },
};
const queueEnabledMessage = {
  true: {
    title: '대기열 시스템 활성화',
    subtitle: '대기열이 적용되어 활성사용자 수를 제어합니다.',
  },
  false: {
    title: '대기열 시스템 비활성화',
    subtitle: '사이트 전체에 대기열이 적용되지 않고, 즉시 진입이 가능한 상태가 됩니다',
  },
};

function FieldsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {[1, 2, 3].map((item) => (
        <Skeleton key={item} className="h-18 w-full max-w-2xl rounded-lg" />
      ))}
    </div>
  );
}

export default function SiteDetailPage() {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const role = user?.userRole ?? user?.role;
  const isSuperUser = role === 'SUPER';
  const canEditSiteInfo = isSuperUser;
  const canManageSiteStatus = isSuperUser;
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [queueEnabled, setQueueEnabled] = useState(false);
  const [reason, setReason] = useState('');
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);
  const [isKeyRotationPending, setIsKeyRotationPending] = useState(false);
  const [isKeyRotationConfirmOpen, setIsKeyRotationConfirmOpen] = useState(false);
  const [newApiKey, setNewApiKey] = useState(null);
  const [keyRotationReason, setKeyRotationReason] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeletePending, setIsDeletePending] = useState(false);
  const [isRoomSyncDialogOpen, setIsRoomSyncDialogOpen] = useState(false);
  const [isSiteSyncDialogOpen, setIsSiteSyncDialogOpen] = useState(false);
  const [syncTarget, setSyncTarget] = useState(null);
  const load = useCallback(async () => {
    try {
      const { data } = await SiteClient.getManagedSite(siteId);
      setSite(data);
      setName(data.siteName ?? '');
      setDescription(data.siteDescription ?? '');
      setEnabled(Boolean(data.siteEnabled));
      setQueueEnabled(Boolean(data.queueEnabled));
    } catch (error) {
      console.error(error);
      ToastUtil.error('사이트 상세', '사이트 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [siteId]);
  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);
  const changes = useMemo(() => {
    if (!site) return {};
    const current = {
      siteName: name,
      siteDescription: description,
    };
    const previous = {
      siteName: site.siteName ?? '',
      siteDescription: site.siteDescription ?? '',
    };
    if (canManageSiteStatus) {
      current.siteEnabled = enabled;
      current.queueEnabled = queueEnabled;
      previous.siteEnabled = Boolean(site.siteEnabled);
      previous.queueEnabled = Boolean(site.queueEnabled);
    }
    return Object.fromEntries(
      Object.keys(current)
        .filter((field) => current[field] !== previous[field])
        .map((field) => [field, { before: previous[field], after: current[field] }])
    );
  }, [canManageSiteStatus, description, enabled, name, queueEnabled, site]);
  const isDirty = Object.keys(changes).length > 0;
  const confirmNavigation = useUnsavedChanges(isDirty);
  const submit = async (event) => {
    event.preventDefault();
    if (!canEditSiteInfo) {
      ToastUtil.error('사이트 관리', '사이트 정보를 변경할 권한이 없습니다.');
      return;
    }
    if (Object.keys(changes).length === 0) {
      ToastUtil.error('사이트 관리', '변경된 항목이 없습니다.');
      return;
    }
    if (!name.trim()) {
      ToastUtil.error('사이트 관리', '사이트명을 입력해 주세요.');
      return;
    }
    setIsSaveConfirmOpen(true);
  };
  const handleSaveConfirmed = async () => {
    if (!reason.trim()) return;
    setSaving(true);
    try {
      const payload = { reason: reason.trim() };
      if (changes.siteName) payload.siteName = name.trim();
      if (changes.siteDescription) payload.siteDescription = description.trim();
      if (canManageSiteStatus && changes.siteEnabled) payload.siteEnabled = enabled;
      if (canManageSiteStatus && changes.queueEnabled) payload.queueEnabled = queueEnabled;
      await SiteClient.updateSiteInfo(siteId, payload);
      setReason('');
      setIsSaveConfirmOpen(false);
      await load();
      ToastUtil.success('사이트 관리', '성공적으로 저장했습니다.');
    } catch (error) {
      console.error(error);
      ToastUtil.error('사이트 관리', error.response?.data?.detail ?? '사이트 정보를 저장하지 못했습니다.');
    } finally {
      setSaving(false);
    }
  };
  const handleSaveConfirmOpenChange = (open) => {
    setIsSaveConfirmOpen(open);
    if (!open && !saving) setReason('');
  };
  const rotateApiKey = async () => {
    if (!keyRotationReason.trim()) {
      ToastUtil.error('API Key 발급', '변경 사유를 입력해 주세요.');
      return;
    }
    setIsKeyRotationPending(true);
    try {
      const { data } = await SiteClient.rotateSiteApiKey(siteId, keyRotationReason.trim());
      setNewApiKey(data.apiKey);
      setKeyRotationReason('');
    } catch (error) {
      ToastUtil.error('API Key 발급', error.response?.data?.detail ?? '새 API Key를 발급하지 못했습니다.');
    } finally {
      setIsKeyRotationPending(false);
    }
  };
  const closeNewApiKey = (open) => {
    if (!open) {
      setNewApiKey(null);
    }
  };
  const copyNewApiKey = async () => {
    try {
      await navigator.clipboard.writeText(newApiKey);
      ToastUtil.success('API Key 발급', '새 API Key를 복사했습니다.');
    } catch {
      ToastUtil.error('API Key 발급', 'API Key를 복사하지 못했습니다.');
    }
  };
  const handleDeleteOpenChange = (open) => {
    setIsDeleteOpen(open);
    if (!open && !isDeletePending) {
      setDeleteConfirmation('');
      setDeleteReason('');
    }
  };
  const deleteSite = async () => {
    if (deleteConfirmation !== siteId || !deleteReason.trim()) return;
    setIsDeletePending(true);
    try {
      await SiteClient.deleteSite(siteId, deleteReason.trim());
      ToastUtil.success('사이트 폐기', '사이트와 소속 계정 및 대기열을 비활성화했습니다.');
      navigate('/sites');
    } catch (error) {
      ToastUtil.error('사이트 폐기', error.response?.data?.detail ?? '사이트를 폐기하지 못했습니다.');
    } finally {
      setIsDeletePending(false);
    }
  };
  const handleSyncRoomData = async () => {
    setSyncTarget('room');
    try {
      await RoomClient.syncRoomData();
      ToastUtil.success('운영 데이터 동기화', '대기열 설정을 서버에 즉시 반영했습니다.');
      setIsRoomSyncDialogOpen(false);
    } catch (error) {
      console.error(error);
      ToastUtil.error('운영 데이터 동기화', error.response?.data?.detail ?? '대기열 설정 반영에 실패했습니다.');
    } finally {
      setSyncTarget(null);
    }
  };
  const handleSyncSiteData = async () => {
    setSyncTarget('site');
    try {
      await SiteClient.syncAllSiteData();
      ToastUtil.success(
        '운영 데이터 동기화',
        isSuperUser ? '모든 사이트 설정을 서버에 즉시 반영했습니다.' : '현재 사이트 설정을 서버에 즉시 반영했습니다.'
      );
      setIsSiteSyncDialogOpen(false);
    } catch (error) {
      console.error(error);
      ToastUtil.error('운영 데이터 동기화', error.response?.data?.detail ?? '사이트 설정 반영에 실패했습니다.');
    } finally {
      setSyncTarget(null);
    }
  };
  return (
    <div className="w-full bg-neutral-50">
      <div className="max-w-[1080px] p-4 sm:p-6">
        <header className="mb-4 mt-4 flex items-center justify-between gap-4 sm:mt-8">
          <h1 className="text-2xl font-bold sm:text-3xl">사이트 상세</h1>
          <Button
            size="lg"
            isIconOnly
            variant="ghost"
            onPress={() => confirmNavigation() && navigate('/sites')}
            aria-label="사이트 목록으로 돌아가기"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </header>
        {loading ? (
          <>
            <FormSection title="사이트 정보">
              <FieldsSkeleton />
            </FormSection>
            <FormSection title="운영 상태">
              <FieldsSkeleton />
            </FormSection>
          </>
        ) : !site ? (
          <p className="py-10 text-center text-sm text-muted">사이트 정보를 찾을 수 없습니다.</p>
        ) : (
          <>
            <Form className="flex flex-col gap-4" validationBehavior="native" onSubmit={submit}>
              <FormSection title="사이트 정보">
                <div className="flex w-full flex-col gap-6">
                  <TextField className="w-full max-w-2xl" isReadOnly>
                    <Label className="text-base">사이트 ID</Label>
                    <Input className="ring-1 focus:ring-2 ring-neutral-200 bg-neutral-100" value={site.siteId} />
                  </TextField>
                  <TextField name="siteName" className="w-full max-w-2xl" isRequired isReadOnly={!canEditSiteInfo}>
                    <Label className="text-base">사이트명</Label>
                    <Input
                      className={`${fieldClass} text-base`}
                      value={name}
                      maxLength={255}
                      onChange={(event) => setName(event.target.value)}
                    />
                    <FieldError>사이트명을 입력해 주세요.</FieldError>
                  </TextField>
                  <TextField className="w-full max-w-2xl" isReadOnly={!canEditSiteInfo}>
                    <Label className="text-base">사이트 설명</Label>
                    <TextArea
                      className={`${fieldClass} text-base`}
                      value={description}
                      maxLength={4000}
                      rows={3}
                      placeholder="사이트에 대한 설명을 입력해 주세요."
                      onChange={(event) => setDescription(event.target.value)}
                    />
                  </TextField>
                </div>
              </FormSection>
              <FormSection title="운영 상태">
                <div className="flex flex-col gap-6">
                  {canManageSiteStatus && (
                    <div className="flex flex-col gap-2">
                      <Label className="text-base" isRequired>
                        사이트 활성/비활성화
                      </Label>
                      <Switch isSelected={enabled} onChange={setEnabled} className="group w-full max-w-lg">
                        <Switch.Content className="flex min-h-20 w-full flex-row-reverse items-center justify-between gap-3 rounded-lg border-2 border-default bg-white p-4 hover:bg-neutral-100 group-data-[selected=true]:border-accent">
                          <Switch.Control>
                            <Switch.Thumb>
                              <Switch.Icon />
                            </Switch.Thumb>
                          </Switch.Control>
                          <span className="flex min-w-0 flex-col gap-1">
                            <span className="text-base">{enabledMessage[enabled].title}</span>
                            <span className="text-sm text-muted">{enabledMessage[enabled].subtitle}</span>
                          </span>
                        </Switch.Content>
                      </Switch>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <Label className="text-base" isRequired>
                      대기열 시스템 활성/비활성화
                    </Label>
                    <Switch
                      isSelected={queueEnabled}
                      onChange={setQueueEnabled}
                      className="group w-full max-w-lg"
                      isRequired
                      validationBehavior="aria"
                      isDisabled={!canManageSiteStatus}
                    >
                      <Switch.Content className="flex min-h-14 w-full flex-row-reverse items-center justify-between gap-2 rounded-lg border-2 border-default bg-white p-4 hover:bg-neutral-100 group-data-[selected=true]:border-accent">
                        <Switch.Control>
                          <Switch.Thumb>
                            <Switch.Icon />
                          </Switch.Thumb>
                        </Switch.Control>
                        <span className="flex min-w-0 flex-col gap-1">
                          <span className="text-base">{queueEnabledMessage[queueEnabled]?.title}</span>
                          <span className="text-sm text-muted">{queueEnabledMessage[queueEnabled]?.subtitle}</span>
                        </span>
                      </Switch.Content>
                    </Switch>
                    {!canManageSiteStatus && (
                      <Description className="text-sm text-muted">
                        대기열 운영 상태는 시스템 설정에서 변경할 수 있습니다.
                      </Description>
                    )}
                  </div>
                </div>
              </FormSection>
              {canEditSiteInfo && (
                <FormSection title="운영 데이터 동기화">
                  <div className="flex w-full max-w-2xl flex-col gap-4">
                    <Description className="text-sm text-muted">
                      최근 변경한 서버 설정을 즉시 다시 반영합니다. 동기화 중에는 잠시 기다려 주세요.
                    </Description>
                    <div className="flex flex-wrap gap-3">
                      <ConfirmAlertDialog
                        title="대기열 설정을 동기화할까요?"
                        message="모든 대기열 설정을 서버에 즉시 다시 반영합니다."
                        confirmMessage="대기열 동기화"
                        isOpen={isRoomSyncDialogOpen}
                        onConfirm={handleSyncRoomData}
                        onOpenChange={setIsRoomSyncDialogOpen}
                      >
                        <Button
                          type="button"
                          variant="secondary"
                          isPending={syncTarget === 'room'}
                          className="min-h-11"
                        >
                          전체 대기열 설정 동기화
                        </Button>
                      </ConfirmAlertDialog>

                      <ConfirmAlertDialog
                        title={isSuperUser ? '전체 사이트 설정을 동기화할까요?' : '사이트 설정을 동기화할까요?'}
                        message={
                          isSuperUser
                            ? '모든 사이트 설정을 서버에 즉시 다시 반영합니다.'
                            : '현재 사이트 설정을 서버에 즉시 다시 반영합니다.'
                        }
                        confirmMessage={isSuperUser ? '전체 사이트 동기화' : '사이트 동기화'}
                        isOpen={isSiteSyncDialogOpen}
                        onConfirm={handleSyncSiteData}
                        onOpenChange={setIsSiteSyncDialogOpen}
                      >
                        <Button
                          type="button"
                          variant="secondary"
                          isPending={syncTarget === 'site'}
                          className="min-h-11"
                        >
                          {isSuperUser ? '전체 사이트 설정 동기화' : '사이트 설정 동기화'}
                        </Button>
                      </ConfirmAlertDialog>
                    </div>
                  </div>
                </FormSection>
              )}
              {role === 'SUPER' && (
                <FormSection title="API Key">
                  <div className="flex max-w-2xl flex-col gap-4">
                    <Description className="text-sm text-muted">
                      기존 API Key를 폐기하고 새로운 API Key를 발급합니다.
                    </Description>
                    <ConfirmAlertDialog
                      title="새 API Key를 발급할까요?"
                      message={
                        <div className="flex flex-col gap-3">
                          <p>기존 API Key는 즉시 만료되며 되돌릴 수 없습니다.</p>
                          <TextField className="w-full" isRequired>
                            <Label>변경 사유</Label>
                            <Input
                              value={keyRotationReason}
                              maxLength={1000}
                              onChange={(event) => setKeyRotationReason(event.target.value)}
                            />
                          </TextField>
                        </div>
                      }
                      confirmMessage="새 API Key 발급"
                      isConfirmDisabled={!keyRotationReason.trim()}
                      isOpen={isKeyRotationConfirmOpen}
                      onOpenChange={(open) => {
                        setIsKeyRotationConfirmOpen(open);
                        if (!open) setKeyRotationReason('');
                      }}
                      onConfirm={rotateApiKey}
                    >
                      <Button
                        type="button"
                        isPending={isKeyRotationPending}
                        isDisabled={isKeyRotationPending}
                        className="min-h-11"
                      >
                        새 API Key 발급
                      </Button>
                    </ConfirmAlertDialog>
                  </div>
                </FormSection>
              )}
              {role === 'SUPER' && (
                <FormSection title="사이트 폐기">
                  <div className="flex max-w-2xl flex-col gap-4">
                    <Description className="text-sm text-danger">
                      사이트를 폐기하면 사이트와 소속 계정 및 대기열이 비활성화됩니다. 이 기능에서는 복구할 수 없습니다.
                    </Description>
                    <Button
                      type="button"
                      variant="danger"
                      className="min-h-11 w-fit"
                      onPress={() => setIsDeleteOpen(true)}
                    >
                      <TrashBin className="h-5 w-5" />
                      사이트 폐기
                    </Button>
                  </div>
                </FormSection>
              )}
              {canEditSiteInfo && (
                <div className="sticky bottom-0 z-20 -mx-3 mt-4 w-[calc(100%+1.5rem)] border-t border-neutral-200 bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:bottom-2 sm:mx-0 sm:w-full sm:rounded-xl sm:border-0 sm:p-0">
                  <Button
                    type="submit"
                    className="min-h-12 rounded-2xl sm:min-h-10"
                    size="lg"
                    isPending={saving}
                    isDisabled={Object.keys(changes).length === 0 || saving}
                    fullWidth
                  >
                    저장하기
                  </Button>
                </div>
              )}
            </Form>
          </>
        )}
      </div>
      <Modal isOpen={isSaveConfirmOpen} onOpenChange={handleSaveConfirmOpenChange}>
        <Modal.Backdrop>
          <Modal.Container size="lg">
            <Modal.Dialog className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
              <Modal.CloseTrigger isDisabled={saving} />
              <Modal.Header>
                <Modal.Heading>사이트 정보 변경 확인</Modal.Heading>
              </Modal.Header>
              <Modal.Body className="flex flex-col gap-4">
                <ChangeDiff changes={changes} />
                <TextField className="w-full" isRequired>
                  <Label>변경 사유</Label>
                  <TextArea
                    value={reason}
                    maxLength={1000}
                    rows={4}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="변경이 필요한 이유를 입력해 주세요."
                  />
                </TextField>
              </Modal.Body>
              <Modal.Footer className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button slot="close" variant="tertiary" isDisabled={saving} className="w-full sm:w-auto">
                  취소
                </Button>
                <Button
                  onPress={handleSaveConfirmed}
                  isPending={saving}
                  isDisabled={!reason.trim() || saving}
                  className="w-full sm:w-auto"
                >
                  변경 적용
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
      <Modal isOpen={newApiKey !== null} onOpenChange={closeNewApiKey}>
        <Modal.Backdrop className="z-49">
          <Modal.Container size="sm">
            <Modal.Dialog className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-md">
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>새 API Key</Modal.Heading>
              </Modal.Header>
              <Modal.Body className="flex flex-col gap-4">
                <p className="text-sm text-danger">이 화면을 닫으면 다시 확인할 수 없습니다.</p>
                <Input isReadOnly value={newApiKey ?? ''} className="font-mono text-sm" />
              </Modal.Body>
              <Modal.Footer className="flex-col-reverse gap-2 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end">
                <Button onPress={copyNewApiKey} className="min-h-11 w-full sm:w-auto">
                  복사하기
                </Button>
                <Button slot="close" variant="tertiary" className="min-h-11 w-full sm:w-auto">
                  닫기
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
      <Modal isOpen={isDeleteOpen} onOpenChange={handleDeleteOpenChange}>
        <Modal.Backdrop>
          <Modal.Container size="sm">
            <Modal.Dialog className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>사이트 폐기</Modal.Heading>
              </Modal.Header>
              <Modal.Body className="flex flex-col gap-4">
                <p className="text-sm text-danger">
                  이 작업은 사이트 ID 재사용이나 화면에서의 복구를 지원하지 않습니다.
                </p>
                <TextField className="w-full" isRequired>
                  <Label>확인을 위해 사이트 ID 입력</Label>
                  <Input
                    value={deleteConfirmation}
                    onChange={(event) => setDeleteConfirmation(event.target.value)}
                    placeholder={siteId}
                  />
                  <Description>{siteId}를 정확히 입력해 주세요.</Description>
                </TextField>
                <TextField className="w-full" isRequired>
                  <Label>폐기 사유</Label>
                  <Input
                    value={deleteReason}
                    maxLength={1000}
                    onChange={(event) => setDeleteReason(event.target.value)}
                  />
                </TextField>
              </Modal.Body>
              <Modal.Footer className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button slot="close" variant="tertiary" className="w-full sm:w-auto">
                  취소
                </Button>
                <Button
                  variant="danger"
                  className="w-full sm:w-auto"
                  isPending={isDeletePending}
                  isDisabled={isDeletePending || deleteConfirmation !== siteId || !deleteReason.trim()}
                  onPress={deleteSite}
                >
                  사이트 폐기
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}
