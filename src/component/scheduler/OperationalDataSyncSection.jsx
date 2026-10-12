import { useState } from 'react';
import { Button, Description } from '@heroui/react';
import FormSection from '../common/FormSection.jsx';
import ConfirmAlertDialog from '../ConfirmAlertDialog.jsx';
import { RoomClient } from '../../api/room/index.js';
import { SiteClient } from '../../api/site/index.js';
import { ToastUtil } from '../../util/toastUtil.js';

export default function OperationalDataSyncSection() {
  const [syncTarget, setSyncTarget] = useState(null);
  const [isRoomSyncOpen, setIsRoomSyncOpen] = useState(false);
  const [isSiteSyncOpen, setIsSiteSyncOpen] = useState(false);

  const syncRooms = async () => {
    setSyncTarget('room');
    try {
      await RoomClient.syncRoomData();
      ToastUtil.success('운영 데이터 동기화', '대기열 설정을 서버에 즉시 반영했습니다.');
      setIsRoomSyncOpen(false);
    } catch (error) {
      console.error(error);
      ToastUtil.error('운영 데이터 동기화', error.response?.data?.detail ?? '대기열 설정 반영에 실패했습니다.');
    } finally {
      setSyncTarget(null);
    }
  };

  const syncAllSites = async () => {
    setSyncTarget('site');
    try {
      await SiteClient.syncAllSiteData();
      ToastUtil.success('운영 데이터 동기화', '모든 사이트 설정과 알림 기준을 서버에 즉시 반영했습니다.');
      setIsSiteSyncOpen(false);
    } catch (error) {
      console.error(error);
      ToastUtil.error('운영 데이터 동기화', error.response?.data?.detail ?? '사이트 설정 반영에 실패했습니다.');
    } finally {
      setSyncTarget(null);
    }
  };

  return (
    <FormSection title="운영 데이터 동기화">
      <div className="flex w-full max-w-2xl flex-col gap-4">
        <Description className="text-sm text-muted">최근 변경한 서버 설정을 즉시 다시 반영합니다.</Description>
        <div className="flex flex-wrap gap-3">
          <ConfirmAlertDialog
            title="대기열 설정을 동기화할까요?"
            message="모든 대기열 설정을 서버에 즉시 다시 반영합니다."
            confirmMessage="대기열 동기화"
            isOpen={isRoomSyncOpen}
            onConfirm={syncRooms}
            onOpenChange={setIsRoomSyncOpen}
          >
            <Button type="button" variant="secondary" isPending={syncTarget === 'room'} className="min-h-11">
              전체 대기열 설정 동기화
            </Button>
          </ConfirmAlertDialog>
          <ConfirmAlertDialog
            title="전체 사이트 설정을 동기화할까요?"
            message="모든 사이트 설정과 알림 기준을 서버에 즉시 다시 반영합니다."
            confirmMessage="전체 사이트 동기화"
            isOpen={isSiteSyncOpen}
            onConfirm={syncAllSites}
            onOpenChange={setIsSiteSyncOpen}
          >
            <Button type="button" variant="secondary" isPending={syncTarget === 'site'} className="min-h-11">
              전체 사이트 설정 동기화
            </Button>
          </ConfirmAlertDialog>
        </div>
      </div>
    </FormSection>
  );
}
