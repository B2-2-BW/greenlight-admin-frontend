import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DragDropProvider } from '@dnd-kit/react';
import { isSortable } from '@dnd-kit/react/sortable';
import PipeCard from '../component/dashboard-v2/PipeCard.jsx';
import SortablePipeCard from '../component/dashboard-v2/SortablePipeCard.jsx';
import { DashboardClient } from '../api/dashboard/index.js';
import { RoomClient } from '../api/room/index.js';
import DashboardContext from '../provider/DashboardProvider.jsx';
import { Button, Skeleton, Spinner, Surface } from '@heroui/react';
import { DashboardFilterBar } from '../component/dashboard-v2/DashboardFilterBar.jsx';
import { useUserStore } from '../store/user.jsx';
import { getEffectiveSiteId } from '../util/siteUtil.js';
import { SiteClient } from '../api/site/index.js';
import { useNavigate } from 'react-router';
import { FaceSurprise, Magnifier } from '@gravity-ui/icons';
import { usePreferenceStore } from '../store/preference.jsx';
import {
  DEFAULT_DASHBOARD_SORT,
  getDashboardSortKey,
  reorderDashboardRooms,
  sortDashboardRooms,
} from '../util/dashboardSort.js';

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

function DashboardOverlay({ children }) {
  return (
    <div className="absolute h-[calc(100vh-68px)] w-full z-12 top-0 left-0 flex items-center justify-center bg-white/40 dark:bg-neutral-950/60 backdrop-blur-xs">
      <Surface className="flex flex-col items-center gap-5 px-8 py-8 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm max-w-sm w-[calc(100%-2rem)]">
        {children}
      </Surface>
    </div>
  );
}

export default function DashboardV2Page() {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isInitialLoadError, setIsInitialLoadError] = useState(false);
  const [connectionErrors, setConnectionErrors] = useState({ rooms: false, metrics: false });
  const hasLoadedDashboard = useRef(false);

  const [roomList, setRoomList] = useState([]);
  const [queueEnabled, setQueueEnabled] = useState(null);

  const {
    dashboardFilter,
    updateDashboardFilter,
    dashboardSort: sortPreferences,
    updateDashboardSort,
  } = usePreferenceStore();

  const [dashboardTraffic, setDashboardTraffic] = useState({});

  const isFetching = useRef(false);

  const roomVersion = useRef('-');
  const metricVersion = useRef('-');

  const navigate = useNavigate();

  const { user, selectedSiteId } = useUserStore();
  const siteId = getEffectiveSiteId(user, selectedSiteId);
  const sortKey = getDashboardSortKey(user?.userId, siteId, dashboardFilter.roomEnvironment);
  const dashboardSort = sortPreferences[sortKey] ?? DEFAULT_DASHBOARD_SORT;
  const sortedRooms = useMemo(() => sortDashboardRooms(roomList, dashboardSort), [roomList, dashboardSort]);

  const changeSortMode = (mode) => {
    updateDashboardSort(sortKey, {
      mode,
      ...(mode === 'custom' && dashboardSort.roomIds.length === 0
        ? { roomIds: sortedRooms.map((room) => room.roomId) }
        : {}),
    });
  };

  const handleDragEnd = ({ operation, canceled }) => {
    const { source, target } = operation;
    if (canceled || !target || !isSortable(source) || source.initialIndex === source.index) return;
    updateDashboardSort(sortKey, {
      mode: 'custom',
      roomIds: reorderDashboardRooms(
        dashboardSort.roomIds,
        sortedRooms.map((room) => room.roomId),
        source.initialIndex,
        source.index
      ),
    });
  };

  const fetchRoomList = useCallback(async () => {
    if (!siteId) {
      setIsPageLoading(true);
      return;
    }

    try {
      const res = await SiteClient.findSite(siteId);
      if (res?.status !== 200 || typeof res.data?.queueEnabled !== 'boolean') {
        throw new Error('Failed to fetch site information.');
      }

      const isQueueEnabled = res.data.queueEnabled;
      setQueueEnabled(isQueueEnabled);
      if (!isQueueEnabled || dashboardFilter?.enabled.length === 0) {
        setRoomList([]);
        hasLoadedDashboard.current = true;
        setIsInitialLoadError(false);
        setConnectionErrors({ rooms: false, metrics: false });
        return;
      }

      const param = {
        version: roomVersion.current,
        roomEnvironment: dashboardFilter?.roomEnvironment,
      };

      if (dashboardFilter?.enabled.length === 1) {
        param.enabled = dashboardFilter?.enabled.includes('true');
      }

      const roomResponse = await RoomClient.getRoomList(param);
      if (!Array.isArray(roomResponse.data)) {
        throw new Error('Failed to fetch room list.');
      }
      roomVersion.current = roomResponse.headers['room-version'] ?? '0';
      setRoomList(roomResponse.data);
      hasLoadedDashboard.current = true;
      setIsInitialLoadError(false);
      setConnectionErrors((current) => ({
        rooms: false,
        metrics: roomResponse.data.length > 0 && current.metrics,
      }));
    } catch (error) {
      if ((error.response?.status ?? error.status) === 304) {
        setConnectionErrors((current) => ({ ...current, rooms: false }));
      } else {
        console.error('Polling error:', error);
        setIsInitialLoadError(!hasLoadedDashboard.current);
        setConnectionErrors((current) => ({ ...current, rooms: true }));
      }
    } finally {
      setIsPageLoading(false);
    }
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
    try {
      const room = await RoomClient.getRoomById(roomId);
      setRoomList((prev) => prev.map((r) => (r.roomId === roomId ? { ...room } : r)));
    } catch (error) {
      setConnectionErrors((current) => ({ ...current, rooms: true }));
      throw error;
    }
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
          setConnectionErrors((current) => ({ ...current, metrics: false }));
        })
        .catch((error) => {
          if ((error.response?.status ?? error.status) === 304) {
            setConnectionErrors((current) => ({ ...current, metrics: false }));
          } else {
            console.error('Polling error:', error);
            setConnectionErrors((current) => ({ ...current, metrics: true }));
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
  const isReconnecting = connectionErrors.rooms || connectionErrors.metrics;

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
          dashboardSort,
          changeSortMode,
        }}
      >
        <div className="relative min-w-0 min-h-[calc(100vh-68px)]">
          {isInitialLoadError ? (
            <DashboardOverlay>
              <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                <FaceSurprise width={26} height={26} className="text-neutral-500 dark:text-neutral-400" />
              </div>
              <p className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 tracking-tight leading-snug text-center">
                사이트 정보를 불러오지 못했습니다
              </p>
              <Button size="md" onPress={fetchRoomList}>
                다시 불러오기
              </Button>
            </DashboardOverlay>
          ) : isReconnecting ? (
            <DashboardOverlay>
              <Spinner color="accent" size="lg" aria-label="연결중입니다..." />
              <p
                role="status"
                className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 tracking-tight leading-snug text-center"
              >
                연결중입니다...
              </p>
            </DashboardOverlay>
          ) : queueEnabled === false ? (
            <DashboardOverlay>
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
            </DashboardOverlay>
          ) : null}

          <div className="flex flex-col gap-3 px-4 pt-4 sm:flex-row sm:items-baseline sm:gap-4">
            <div className="shrink-0 whitespace-nowrap text-3xl font-bold">대시보드</div>
            <div className="min-w-0 flex-1">
              <DashboardFilterBar />
            </div>
          </div>
          {isInitialLoadError ? null : roomList.length === 0 ? (
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

              <DragDropProvider onDragEnd={handleDragEnd}>
                <section className="grid auto-rows-[400px] gap-4 md:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] md:overflow-y-auto md:pr-2.5">
                  {sortedRooms.map((room, index) => (
                    <SortablePipeCard
                      key={room.roomId}
                      room={room}
                      index={index}
                      group={sortKey}
                      disabled={isReconnecting}
                      trafficData={dashboardTraffic?.detail?.[room.roomId]}
                      emitSignal={dashboardTraffic?.version}
                    />
                  ))}
                </section>
              </DragDropProvider>
            </div>
          )}
        </div>
      </DashboardContext.Provider>
    </>
  );
}
