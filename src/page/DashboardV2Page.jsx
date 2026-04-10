import { useCallback, useEffect, useRef, useState } from 'react';
import PipeCard from '../component/dashboard-v2/PipeCard.jsx';
import { DashboardClient } from '../api/dashboard/index.js';
import { RoomClient } from '../api/room/index.js';
import DashboardContext from '../provider/DashboardProvider.jsx';
import { Button, Skeleton, Surface } from '@heroui/react';
import { DashboardFilterBar } from '../component/dashboard-v2/DashboardFilterBar.jsx';
import { useUserStore } from '../store/user.jsx';
import { SiteClient } from '../api/site/index.js';
import { useNavigate } from 'react-router';
import { FaceSurprise } from '@gravity-ui/icons';

const layoutStyle = {
  container: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr', // [Main Pipe] [Grid Area]
    gap: '16px',
    padding: '16px',
    height: 'calc(100vh - 128px)',
    // background: '#f8fafc',
    overflow: 'hidden',
  },
  gridArea: {
    display: 'grid',
    // 반응형 그리드: 최소 220px 확보, 화면 꽉 채우기
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gridAutoRows: '400px', // PipeCard Compact Height와 일치
    gap: '16px',
    overflowY: 'auto',
    paddingRight: '10px', // 스크롤바 여백
  },
};

const calculateSummary = (result) => {
  if (result?.detail == null) {
    return {};
  }
  const values = Object.values(result.detail);
  return values.reduce(
    (acc, curr) => {
      // 단순 총합 계산
      acc.estimatedWaitTime = Math.max(acc.estimatedWaitTime, curr.estimatedWaitTime);
      acc.totalWaiting += curr.totalWaiting;
      acc.totalActive += curr.totalActive;
      acc.waitingCount += curr.waitingCount;
      acc.enteredCount += curr.enteredCount;
      acc.exitedCount += curr.exitedCount;
      acc.waitingRate += curr.waitingRate;
      acc.enteredRate += curr.enteredRate;
      acc.exitedRate += curr.exitedRate;

      return acc;
    },
    {
      estimatedWaitTime: 0,
      totalWaiting: 0,
      totalActive: 0,
      waitingCount: 0,
      enteredCount: 0,
      exitedCount: 0,
      waitingRate: 0,
      enteredRate: 0,
      exitedRate: 0,
    }
  );
};

export default function DashboardV2Page() {
  const [isPageLoading, setIsPageLoading] = useState(true);

  const [roomList, setRoomList] = useState([]);
  const [siteEnabled, setSiteEnabled] = useState(false);
  const [dashboardTraffic, setDashboardTraffic] = useState({});

  const isFetching = useRef(false);

  const metricVersion = useRef(0);

  const navigate = useNavigate();

  const fetchRoomList = useCallback(async () => {
    // setIsPageLoading(true);
    try {
      const me = useUserStore.getState().user;
      const res = await SiteClient.findSite(me.siteId);
      const siteInfo = res.data;

      setSiteEnabled(siteInfo.siteEnabled);

      const roomList = await RoomClient.getRoomList({ enabled: true });
      setRoomList(roomList);
    } finally {
      setIsPageLoading(false);
    }
  }, []);

  const fetchRoomById = useCallback(async (roomId) => {
    const room = await RoomClient.getRoomById(roomId);
    setRoomList((prev) => prev.map((r) => (r.roomId === roomId ? { ...room } : r)));
  }, []);

  useEffect(() => {
    document.title = '대시보드 | Greenlight Admin';
    fetchRoomList();

    const intervalId = setInterval(fetchRoomList, 10_000); // 10초마다

    return () => clearInterval(intervalId); // 언마운트 시 정리
  }, []);

  useEffect(() => {
    // 데이터를 가져오는 비동기 함수
    const fetchData = async () => {
      if (isFetching.current) {
        return;
      }
      isFetching.current = true;
      DashboardClient.getDashboardDetail({ version: metricVersion.current })
        .then((res) => {
          // console.log('version', metricVersion);
          const result = res.data;
          metricVersion.current = result.version;

          result.summary = calculateSummary(result);
          setDashboardTraffic(result);
        })
        .catch((error) => {
          if (error.status !== 304) {
            console.error('Polling error:', error);
          }
        })
        .finally(() => {
          isFetching.current = false;
        });
    };

    // 처음 마운트 시 한 번 실행
    fetchData();

    // 1초(1000ms)마다 fetchData 실행
    const intervalId = setInterval(fetchData, 3000);

    // 컴포넌트 언마운트 시 인터벌 제거 (메모리 누수 방지)
    return () => clearInterval(intervalId);
  }, [roomList]);

  const mainRoom = {
    name: '전체 대기열 통합',
    capacity: roomList.reduce((acc, cur) => acc + (cur.capacity || 0), 0),
  };

  if (isPageLoading)
    return (
      <div style={layoutStyle.container}>
        <Skeleton className="h-full rounded-lg" />

        <section style={layoutStyle.gridArea}>
          <Skeleton className="h-[400px] rounded-lg" />
          <Skeleton className="h-[400px] rounded-lg" />
          <Skeleton className="h-[400px] rounded-lg" />
        </section>
      </div>
    );

  return (
    <>
      <DashboardContext.Provider value={{ fetchRoomList, fetchRoomById }}>
        <div className="relative">
          {!siteEnabled && (
            <div className="absolute h-[calc(100vh-68px)] w-full z-12 top-0 left-0 flex items-center justify-center bg-white/40 dark:bg-neutral-950/60 backdrop-blur-xs">
              <Surface className="flex flex-col items-center gap-5 px-8 py-8 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-xl max-w-sm w-[calc(100%-2rem)]">
                {/* Icon container */}
                <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                  <FaceSurprise width={26} height={26} className="text-neutral-500 dark:text-neutral-400" />
                </div>

                {/* Message */}
                <div className="flex flex-col items-center gap-2 text-center">
                  <p className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 tracking-tight leading-snug">
                    대기열 시스템이 비활성화되어 있습니다
                  </p>
                  <p className="text-base text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    설정에서 대기열 시스템을 활성화해 주세요.
                  </p>
                </div>

                {/* CTA */}
                <Button size="md" onPress={() => navigate('/settings')}>
                  설정 변경하러 가기
                </Button>
              </Surface>
            </div>
          )}

          <div className="pt-4 px-4 flex items-baseline gap-2">
            <div className="font-bold text-3xl">대시보드</div>
            <DashboardFilterBar />
          </div>
          <div style={layoutStyle.container}>
            {/* 1. Main Pipe (Left Sidebar Area) */}
            <section style={{ height: '100%' }}>
              <PipeCard
                mode="main"
                trafficData={dashboardTraffic?.summary}
                room={mainRoom}
                emitSignal={dashboardTraffic?.version}
              />
            </section>

            {/* 2. Sub Pipes Grid (Right Area) */}
            <section style={layoutStyle.gridArea}>
              {roomList.map((room) => (
                <PipeCard
                  key={room.roomId}
                  mode="compact"
                  room={room}
                  trafficData={dashboardTraffic?.detail?.[room.roomId]}
                  emitSignal={dashboardTraffic?.version}
                />
              ))}
            </section>
          </div>
        </div>
      </DashboardContext.Provider>
    </>
  );
}
