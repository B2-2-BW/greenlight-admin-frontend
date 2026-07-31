import { Button, Description, Form, Input, Label, Modal, Skeleton, Switch, TextField } from '@heroui/react';
import FormSection from '../common/FormSection.jsx';
import ConfirmAlertDialog from '../ConfirmAlertDialog.jsx';
import { useEffect, useMemo, useState } from 'react';
import { SiteClient } from '../../api/site/index.js';
import { RoomClient } from '../../api/room/index.js';
import { useUserStore } from '../../store/user.jsx';
import { ToastUtil } from '../../util/toastUtil.js';
import ChangeDiff from '../audit/ChangeDiff.jsx';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges.js';

const enabledMessage = {
  true: {
    title: '대기열 시스템 활성화',
    subtitle: '대기열이 적용되어 활성사용자 수를 제어합니다.',
  },
  false: {
    title: '대기열 시스템 비활성화',
    subtitle: '사이트 전체에 대기열이 적용되지 않고, 즉시 진입이 가능한 상태가 됩니다',
  },
};

export default function SiteSettingsForm() {
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [siteInfo, setSiteInfo] = useState({});

  const [editQueueEnabled, setEditQueueEnabled] = useState(true);
  const [reason, setReason] = useState('');
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);
  const [isRoomSyncDialogOpen, setIsRoomSyncDialogOpen] = useState(false);
  const [isSiteSyncDialogOpen, setIsSiteSyncDialogOpen] = useState(false);
  const [syncTarget, setSyncTarget] = useState(null);

  const user = useUserStore((state) => state.user);
  const userRole = user?.role ?? user?.userRole;
  const canSyncRoomData = userRole === 'SITE_ADMIN' || userRole === 'SUPER';
  const canManageQueue = userRole === 'SITE_ADMIN' || userRole === 'SUPER';
  const isSuperUser = userRole === 'SUPER';
  const changes = useMemo(() => {
    if (!siteInfo?.siteId || Boolean(siteInfo.queueEnabled) === editQueueEnabled) return {};
    return {
      queueEnabled: {
        before: Boolean(siteInfo.queueEnabled),
        after: editQueueEnabled,
      },
    };
  }, [editQueueEnabled, siteInfo]);
  useUnsavedChanges(Object.keys(changes).length > 0);

  const fetchSiteInfo = async () => {
    setIsPageLoading(true);

    try {
      const me = useUserStore.getState().user;
      const res = await SiteClient.findSite(me.siteId);
      const data = res.data;
      setSiteInfo(data);
      setEditQueueEnabled(Boolean(data?.queueEnabled));
    } catch (error) {
      console.error('Error fetching siteInfo:', error);
    } finally {
      setIsPageLoading(false);
    }
  };

  // Location 이동 시 실행
  useEffect(() => {
    fetchSiteInfo();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canManageQueue) {
      ToastUtil.error('시스템 설정', '대기열 설정을 변경할 권한이 없습니다.');
      return;
    }
    if (Object.keys(changes).length === 0) {
      ToastUtil.error('시스템 설정', '변경된 항목이 없습니다.');
      return;
    }
    setIsSaveConfirmOpen(true);
  };

  const handleSaveConfirmed = async () => {
    if (!reason.trim()) return;
    setIsSubmitLoading(true);

    try {
      const response = await SiteClient.updateQueueEnabled(siteInfo.siteId, editQueueEnabled, reason.trim());
      if (response.status !== 200) {
        throw new Error('failed to create room ' + JSON.stringify(response));
      }
      setReason('');
      setIsSaveConfirmOpen(false);
      await fetchSiteInfo();
      ToastUtil.success('시스템 설정', '저장 후 적용된 설정을 확인했습니다.');
    } catch (error) {
      console.error(error.response);
      ToastUtil.error('시스템 설정', error.response?.data?.detail ?? '저장에 실패했습니다.');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleSaveConfirmOpenChange = (open) => {
    setIsSaveConfirmOpen(open);
    if (!open && !isSubmitLoading) setReason('');
  };

  const handleSyncRoomData = async () => {
    if (!canSyncRoomData) {
      ToastUtil.error('운영 데이터 동기화', '대기열 설정을 동기화할 권한이 없습니다.');
      return;
    }
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

  const handleSyncAllSiteData = async () => {
    if (!canSyncRoomData) {
      ToastUtil.error('운영 데이터 동기화', '사이트 설정을 동기화할 권한이 없습니다.');
      return;
    }
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
    <>
      <Form className="w-full flex flex-col" onSubmit={handleSubmit}>
        <div className="relative w-full flex flex-col gap-4 min-h-[600px]">
          <div className="w-full">
            <div className="flex justify-between items-center">
              <div className="flex flex-row gap-6">
                {/*<Tooltip content="뒤로가기">*/}
                {/*  <Button size="sm" isIconOnly variant="light" onPress={onPressBack}>*/}
                {/*    <ArrowBackSvg />*/}
                {/*  </Button>*/}
                {/*</Tooltip>*/}
              </div>
            </div>
            {/*<Skeleton className="rounded-lg w-full h-10" isLoaded={!isPageLoading}>*/}
            {/*  <div className="flex items-baseline gap-2">*/}
            {/*    <div className="font-bold text-3xl">액션 그룹 {actionGroupId == null ? '생성' : '상세'}</div>*/}
            {/*    {<RoomStatusChip enabled={actionGroup?.enabled} />}*/}
            {/*  </div>*/}
            {/*</Skeleton>*/}
          </div>
          <FormSection title="사이트 정보">
            {isPageLoading ? (
              <div className="flex flex-col gap-6">
                <Skeleton className="rounded-lg w-md h-16" />
                <Skeleton className="rounded-lg w-md h-16" />
              </div>
            ) : (
              <div className="flex flex-col w-full gap-6">
                <TextField name="siteId" type="text" className="w-full max-w-md" isReadOnly>
                  <Label className="text-base">사이트 ID</Label>
                  <Input className="ring-1 focus:ring-2 ring-neutral-200 bg-neutral-100" value={siteInfo?.siteId} />
                </TextField>

                <TextField name="siteName" type="text" isReadOnly className="w-full max-w-md" variant="default">
                  <Label className="text-base">사이트명</Label>
                  <Input className="ring-1 focus:ring-2 ring-neutral-200 bg-neutral-100" value={siteInfo?.siteName} />
                </TextField>
              </div>
            )}
          </FormSection>
          <FormSection title="대기열 관리">
            {isPageLoading ? (
              <div className="flex flex-col gap-6">
                <Skeleton className="rounded-lg w-md h-29" />
              </div>
            ) : (
              <div className="flex flex-col w-full gap-6">
                <div className="flex flex-col gap-2">
                  <Label className="text-base" isRequired>
                    대기열 시스템 활성/비활성화
                  </Label>

                  <Switch
                    isSelected={editQueueEnabled}
                    onChange={setEditQueueEnabled}
                    className="group w-full max-w-lg"
                    isRequired
                    validationBehavior="aria"
                    isDisabled={!canManageQueue}
                  >
                    <Switch.Content className="flex min-h-14 w-full flex-row-reverse items-center justify-between gap-2 rounded-lg border-2 border-default bg-white p-4 hover:bg-neutral-100 group-data-[selected=true]:border-accent">
                      <Switch.Control>
                        <Switch.Thumb>
                          <Switch.Icon />
                        </Switch.Thumb>
                      </Switch.Control>
                      <span className="flex min-w-0 flex-col gap-1">
                        <span className="text-base">{enabledMessage[editQueueEnabled]?.title}</span>
                        <span className="text-sm text-muted">{enabledMessage[editQueueEnabled]?.subtitle}</span>
                      </span>
                    </Switch.Content>
                  </Switch>
                  {!canManageQueue && (
                    <Description className="text-sm text-muted">
                      일반 사용자는 대기열 운영 상태를 조회할 수 있지만 변경할 수 없습니다.
                    </Description>
                  )}
                </div>
              </div>
            )}
          </FormSection>

          {canSyncRoomData && (
            <FormSection title="운영 데이터 동기화">
              <div className="flex flex-col w-full max-w-lg gap-4">
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
                    <Button variant="secondary" isPending={syncTarget === 'room'} className="min-h-11">
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
                    onConfirm={handleSyncAllSiteData}
                    onOpenChange={setIsSiteSyncDialogOpen}
                  >
                    <Button variant="secondary" isPending={syncTarget === 'site'} className="min-h-11">
                      {isSuperUser ? '전체 사이트 설정 동기화' : '사이트 설정 동기화'}
                    </Button>
                  </ConfirmAlertDialog>
                </div>
              </div>
            </FormSection>
          )}

          {/*<SectionTitle title="활성사용자/세션 유지시간">*/}
          {/*  <Skeleton className="rounded-lg w-full" isLoaded={!isPageLoading}>*/}
          {/*    <div className="flex flex-col w-full gap-6">*/}
          {/*      <div>*/}
          {/*        <div className="mb-2 text-base after:content-['*'] after:text-danger after:ms-0.5">*/}
          {/*          대기열 시스템 활성/비활성화*/}
          {/*        </div>*/}
          {/*      </div>*/}
          {/*    </div>*/}
          {/*  </Skeleton>*/}
          {/*</SectionTitle>*/}
        </div>
        {canManageQueue && (
          <div className="sticky bottom-0 z-20 mt-4 w-full rounded-xl bg-white/95 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur">
            <Button
              size="lg"
              className="min-h-11 rounded-2xl"
              type="submit"
              isPending={isSubmitLoading}
              isDisabled={Object.keys(changes).length === 0 || isSubmitLoading}
              fullWidth
            >
              저장하기
            </Button>
          </div>
        )}
      </Form>

      <Modal isOpen={isSaveConfirmOpen} onOpenChange={handleSaveConfirmOpenChange}>
        <Modal.Backdrop>
          <Modal.Container size="lg">
            <Modal.Dialog className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>시스템 설정 변경 확인</Modal.Heading>
              </Modal.Header>
              <Modal.Body className="flex flex-col gap-4">
                <ChangeDiff changes={changes} />
                <TextField className="w-full" isRequired>
                  <Label>변경 사유</Label>
                  <Input
                    value={reason}
                    maxLength={1000}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="변경이 필요한 이유를 입력해 주세요."
                  />
                </TextField>
              </Modal.Body>
              <Modal.Footer className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button slot="close" variant="tertiary" className="w-full sm:w-auto">
                  취소
                </Button>
                <Button
                  onPress={handleSaveConfirmed}
                  isPending={isSubmitLoading}
                  isDisabled={!reason.trim() || isSubmitLoading}
                  className="w-full sm:w-auto"
                >
                  변경 적용
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      {/*<ConfirmModal*/}
      {/*  isOpen={isOpenConfirm}*/}
      {/*  onOpenChange={onOpenChangeConfirm}*/}
      {/*  title="액션 그룹 삭제"*/}
      {/*  message="정말로 이 액션 그룹을 삭제하시겠습니까?"*/}
      {/*  onConfirm={handleDeleteConfirmed}*/}
      {/*  onCancel={onCloseConfirm}*/}
      {/*/>*/}
    </>
  );
}
