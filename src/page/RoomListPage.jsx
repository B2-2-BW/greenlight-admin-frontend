import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import RoomListTopContent from '../component/room/RoomListTopContent.jsx';
import RoomListTable from '../component/room/RoomListTable.jsx';
import { Chip } from '@heroui/react';
import { TriangleExclamation } from '@gravity-ui/icons';
import { useUserStore } from '../store/user.jsx';
import { SiteClient } from '../api/site/index.js';

export default function RoomListPage() {
  const navigate = useNavigate();
  const [queueEnabled, setQueueEnabled] = useState(true);
  const [filters, setFilters] = useState({ search: '', environment: 'ALL', status: 'ALL' });

  const onPress = (roomId) => {
    navigate(`/rooms/${roomId}`);
  };

  const fetchSiteInfo = async () => {
    const me = useUserStore.getState().user;
    if (!me) {
      return;
    }
    SiteClient.findSite(me?.siteId)
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
  };

  useEffect(() => {
    document.title = '대기열 목록 | Greenlight Admin';
    fetchSiteInfo();
  }, []);

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
        <RoomListTopContent filters={filters} onFiltersChange={setFilters} />
        <RoomListTable
          key={`${filters.search}-${filters.environment}-${filters.status}`}
          filters={filters}
          onPress={onPress}
        />
      </div>
    </>
  );
}
