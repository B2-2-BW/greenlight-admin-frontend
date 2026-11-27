import { useNavigate } from 'react-router';
import { useCallback, useEffect, useState } from 'react';
import RoomListTopContent from '../component/room/RoomListTopContent.jsx';
import RoomListTable from '../component/room/RoomListTable.jsx';
import { Button, Chip } from '@heroui/react';
import { TriangleExclamation } from '@gravity-ui/icons';
import { useUserStore } from '../store/user.jsx';
import { SiteClient } from '../api/site/index.js';
import { getEffectiveSiteId } from '../util/siteUtil.js';
import RoomBulkEditModal from '../component/room/RoomBulkEditModal.jsx';

export default function RoomListPage() {
  const navigate = useNavigate();
  const [queueEnabled, setQueueEnabled] = useState(true);
  const [filters, setFilters] = useState({ search: '', environment: 'ALL', status: 'ALL' });
  const user = useUserStore((state) => state.user);
  const selectedSiteId = useUserStore((state) => state.selectedSiteId);
  const siteId = getEffectiveSiteId(user, selectedSiteId);
  const [editingSiteId, setEditingSiteId] = useState(null);
  const [selectedRooms, setSelectedRooms] = useState(new Map());
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const role = user?.userRole ?? user?.role;
  const canManageRooms = Boolean(siteId) && (role === 'SITE_ADMIN' || role === 'SUPER');
  const isBulkEditing = canManageRooms && editingSiteId === siteId;

  const changeSelection = (visibleRooms, selectedKeys) => {
    setSelectedRooms((current) => {
      const next = new Map(current);
      for (const room of visibleRooms) {
        if (selectedKeys === 'all' || selectedKeys.has(room.roomId)) {
          next.set(room.roomId, room);
        } else {
          next.delete(room.roomId);
        }
      }
      return next;
    });
  };

  const stopBulkEdit = () => {
    setIsBulkModalOpen(false);
    setEditingSiteId(null);
    setSelectedRooms(new Map());
  };

  const toggleBulkEdit = () => {
    if (isBulkEditing) {
      stopBulkEdit();
      return;
    }
    setSelectedRooms(new Map());
    setEditingSiteId(siteId);
  };

  const onPress = (roomId) => {
    navigate(`/rooms/${roomId}`);
  };

  const fetchSiteInfo = useCallback(async () => {
    if (!siteId) {
      return;
    }
    SiteClient.findSite(siteId)
      .then((res) => {
        if (res.status === 200) {
          setQueueEnabled(Boolean(res.data?.queueEnabled));
        } else {
          console.error('failed to reload site', res);
        }
      })
      .catch((err) => {
        console.error('network error while reloading site', err);
      });
  }, [siteId]);

  useEffect(() => {
    document.title = '대기열 목록 | Greenlight Admin';
    fetchSiteInfo();
  }, [fetchSiteInfo]);

  return (
    <>
      <div className="w-full max-w-[1080px] p-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:p-6">
        <div className="mb-4 mt-5 flex flex-wrap items-center gap-2 sm:mt-8">
          <h1 className="text-2xl font-bold sm:text-3xl">대기열 목록</h1>
          {!queueEnabled && (
            <Chip
              className="max-w-full cursor-pointer select-none"
              color="warning"
              variant="primary"
              size="md"
              onClick={() => navigate('/settings')}
            >
              <TriangleExclamation className="mr-1" />
              대기열 시스템 비활성화
            </Chip>
          )}
        </div>
        <RoomListTopContent
          filters={filters}
          onFiltersChange={setFilters}
          isBulkEditing={isBulkEditing}
          onToggleBulkEdit={canManageRooms ? toggleBulkEdit : undefined}
        />
        {isBulkEditing && (
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-separator p-3">
            <p className="mr-auto text-sm font-medium" aria-live="polite">{selectedRooms.size}개 선택</p>
            <Button size="sm" isDisabled={!selectedRooms.size} onPress={() => setIsBulkModalOpen(true)}>
              선택 항목 수정
            </Button>
            <Button size="sm" variant="tertiary" onPress={stopBulkEdit}>
              취소
            </Button>
          </div>
        )}
        <RoomListTable
          key={JSON.stringify([siteId, filters.search, filters.environment, filters.status])}
          filters={filters}
          onPress={onPress}
          isBulkEditing={isBulkEditing}
          selectedRooms={selectedRooms}
          onSelectionChange={changeSelection}
          refreshVersion={refreshVersion}
        />
        {isBulkEditing && isBulkModalOpen && (
          <RoomBulkEditModal
            rooms={[...selectedRooms.values()]}
            onClose={() => setIsBulkModalOpen(false)}
            onSaved={() => {
              stopBulkEdit();
              setRefreshVersion((version) => version + 1);
            }}
          />
        )}
      </div>
    </>
  );
}
