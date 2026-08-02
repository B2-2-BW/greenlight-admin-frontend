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
import { FaceSurprise, Magnifier } from '@gravity-ui/icons';
import { usePreferenceStore } from '../store/preference.jsx';

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
  const [queueEnabled, setQueueEnabled] = useState(false);

  const { dashboardFilter, updateDashboardFilter } = usePreferenceStore();

  const [dashboardTraffic, setDashboardTraffic] = useState({});

  const isFetching = useRef(false);

  const roomVersion = useRef('-');
  const metricVersion = useRef('-');

  const navigate = useNavigate();

  const { user, selectedSiteId } = useUserStore();
  const role = user?.userRole ?? user?.role;
  const siteId = role === 'SUPER' ? selectedSiteId || user?.siteId : user?.siteId;

  const fetchRoomList = useCallback(async () => {
    if (!siteId) {
      setIsPageLoading(true);
      return;
    }

    const res = await SiteClient.findSite(siteId);
    const siteInfo = res.data;
    const isQueueEnabled = Boolean(siteInfo.queueEnabled);
    setQueueEnabled(isQueueEnabled);
    if (!isQueueEnabled || dashboardFilter?.enabled.length === 0) {
      setRoomList([]);
      setIsPageLoading(false);
      return;
    }

    const param = {
      version: roomVersion.current,
      roomEnvironment: dashboardFilter?.roomEnvironment,
    };

    if (dashboardFilter?.enabled.length === 1) {
      param.enabled = dashboardFilter?.enabled.includes('true'); // 'true'를 포함하고 있으면 enabled = true, 아니면 false. length가 2라면 둘 다 선택되었으므로 null
    }

    RoomClient.getRoomList(param)
      .then((res) => {
        const data = res.data;
        roomVersion.current = res.headers['room-version'];
        setRoomList(data);
      })
      .catch((error) => {
        if (error.status !== 304) {
          console.error('Polling error:', error);
        }
      })
      .finally(() => {
        setIsPageLoading(false);
      });
  }, [dashboardFilter?.enabled, dashboardFilter?.roomEnvironment, siteId]);

  useEffect(() => {
    roomVersion.current = '-';

    const initialFetchId = siteId ? setTimeout(fetchRoomList, 0) : null;

    const intervalId = siteId ? setInterval(fetchRoomList, 10_000) : null; // 10초마다

    return () => {
      if (initialFetchId) clearTimeout(initialFetchId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [siteId, dashboardFilter, fetchRoomList]);

  const fetchRoomById = useCallback(async (roomId) => {
    const room = await RoomClient.getRoomById(roomId);
    setRoomList((prev) => prev.map((r) => (r.roomId === roomId ? { ...room } : r)));
  }, []);

  useEffect(() => {
    document.title = '대시보드 | Greenlight Admin';
  }, []);

  useEffect(() => {
    // 데이터를 가져오는 비동기 함수
    const fetchDashboardDetail = async () => {
      if (isFetching.current || roomVersion.current === '-' || roomList.length === 0) {
        return;
      }
      isFetching.current = true;
      const roomIdList = roomList.map((r) => r.roomId) || [];

      DashboardClient.getDashboardDetail({ version: metricVersion.current, roomIdList: roomIdList })
        .then((res) => {
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
    metricVersion.current = '-';
    fetchDashboardDetail();

    // 1초(1000ms)마다 fetchDashboardDetail 실행
    const intervalId = setInterval(fetchDashboardDetail, 3000);

    // 컴포넌트 언마운트 시 인터벌 제거 (메모리 누수 방지)
    return () => clearInterval(intervalId);
  }, [roomList, dashboardFilter, siteId]);

  const mainRoom = {
    name: '전체 대기열 통합',
    capacity: roomList.reduce((acc, cur) => acc + (cur.capacity || 0), 0),
  };

  if (!siteId || isPageLoading)
    return (
      <div className="grid grid-cols-1 gap-4 p-4 md:h-[calc(100vh-128px)] md:grid-cols-[280px_minmax(0,1fr)] md:overflow-hidden">
        <Skeleton className="h-full rounded-lg" />

        <section className="grid auto-rows-[400px] gap-4 md:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] md:overflow-y-auto md:pr-2.5">
          <Skeleton className="h-[400px] rounded-lg" />
          <Skeleton className="h-[400px] rounded-lg" />
          <Skeleton className="h-[400px] rounded-lg" />
        </section>
      </div>
    );

  return (
    <>
      <DashboardContext.Provider
        value={{
          fetchRoomList,
          fetchRoomById,
          dashboardFilter,
          updateDashboardFilter,
        }}
      >
        <div className="relative min-w-0">
          {!queueEnabled && (
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

          <div className="flex flex-col gap-3 px-4 pt-4 sm:flex-row sm:items-baseline sm:gap-4">
            <div className="shrink-0 whitespace-nowrap text-3xl font-bold">대시보드</div>
            <div className="min-w-0 flex-1">
              <DashboardFilterBar />
            </div>
          </div>
          {roomList.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-10">
              <Magnifier className="h-12 w-12 mb-4" />
              <h2 className="transition-all fade-up fade-up-3 text-xl font-semibold tracking-tight text-[#191919] mb-2">
                검색 조건에 맞는 대기열이 없어요
              </h2>
              <p className="transition-all fade-up fade-up-4 text-base text-[#6b7280]">
                조건을 조정하거나, 새로운 대기열 룸을 직접 추가해 보세요.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 p-4 md:h-[calc(100vh-128px)] md:grid-cols-[280px_minmax(0,1fr)] md:overflow-hidden">
              {/* 1. Main Pipe (Left Sidebar Area) */}
              <section className="md:h-full">
                <PipeCard
                  mode="main"
                  trafficData={dashboardTraffic?.summary}
                  room={mainRoom}
                  emitSignal={dashboardTraffic?.version}
                />
              </section>

              <section className="grid auto-rows-[400px] gap-4 md:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] md:overflow-y-auto md:pr-2.5">
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
          )}
        </div>
      </DashboardContext.Provider>
    </>
  );
}
