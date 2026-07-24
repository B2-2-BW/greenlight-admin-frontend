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
  const [siteEnabled, setSiteEnabled] = useState(true);
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
          setSiteEnabled(res.data?.siteEnabled || false);
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
      <div className="p-4 max-w-[1080px]">
        <div className="flex items-baseline gap-2">
          <div className="font-bold text-3xl mt-8 mb-4">대기열 목록</div>
          {!siteEnabled && (
            <Chip
              className="select-none cursor-pointer"
              color="warning"
              variant="primary"
              size="lg"
              onClick={() => navigate('/settings')}
            >
              <TriangleExclamation className="mr-1" />
              대기열 시스템 비활성화
            </Chip>
          )}
        </div>
        <RoomListTopContent filters={filters} onFiltersChange={setFilters} />
        <RoomListTable key={`${filters.search}-${filters.environment}-${filters.status}`} filters={filters} onPress={onPress} />
      </div>
    </>
  );
}
