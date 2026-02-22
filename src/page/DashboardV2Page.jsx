import { useEffect, useState } from 'react';
import PipeCard from '../component/dashboard-v2/PipeCard.jsx';
import { DashboardClient } from '../api/dashboard/index.js';
import { RoomClient } from '../api/room/index.js';
import { Switch } from '@heroui/react';

const layoutStyle = {
  container: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr', // [Main Pipe] [Grid Area]
    gap: '20px',
    padding: '20px',
    height: 'calc(100vh - 68px)',
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

const getRoomCapacityRate = (currentUsers, maxCapacity) => {
  const rate = currentUsers / maxCapacity;
  if (!isNaN(rate)) {
    return 0;
  }
  return rate;
};

const calculateSummary = (detail) => {
  if (detail == null) {
    return {};
  }
  const values = Object.values(detail);
  return values.reduce(
    (acc, curr) => {
      // // 가중치 합산 (대기시간 * 대기인원)
      // acc.weightedWaitTimeSum += curr.estimatedWaitTime * curr.waitingCount;

      // 단순 총합 계산
      acc.estimatedWaitTime = Math.max(acc.estimatedWaitTime, curr.estimatedWaitTime);
      acc.waitingCount += curr.waitingCount;
      acc.roomCapacity += curr.roomCapacity;
      acc.activeCustomerCount += curr.activeCustomerCount;
      acc.inflowRate += curr.inflowRate;
      acc.enteredRate += curr.enteredRate;
      acc.outflowRate += curr.outflowRate;
      acc.inflow += curr.inflow;
      acc.entered += curr.entered;
      acc.outflow += curr.outflow;

      return acc;
    },
    {
      // weightedWaitTimeSum: 0,
      estimatedWaitTime: 0,
      waitingCount: 0,
      roomCapacity: 0,
      activeCustomerCount: 0,
      inflow: 0,
      entered: 0,
      outflow: 0,
      inflowRate: 0,
      enteredRate: 0,
      outflowRate: 0,
    }
  );
};

export default function DashboardV2Page() {
  const [isPageLoading, setIsPageLoading] = useState(true);

  const [roomList, setRoomList] = useState([]);
  const [dashboardTraffic, setDashboardTraffic] = useState({});

  const [mock, setMock] = useState(false);

  const fetchRoomList = async () => {
    try {
      const roomList = await RoomClient.getRoomList();
      setRoomList(roomList);
    } finally {
      setIsPageLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomList();
  }, []);

  useEffect(() => {
    // 데이터를 가져오는 비동기 함수
    const fetchData = async () => {
      try {
        const result = await DashboardClient.getDashboardDetail({ window: '2s', mock: mock });
        result.summary = calculateSummary(result?.detail);
        setDashboardTraffic(result);
        console.log('Data fetched:', result);
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    // 처음 마운트 시 한 번 실행
    fetchData();

    // 2초(2000ms)마다 fetchData 실행
    const intervalId = setInterval(fetchData, 3000);

    // 컴포넌트 언마운트 시 인터벌 제거 (메모리 누수 방지)
    return () => clearInterval(intervalId);
  }, [roomList, mock]);

  if (isPageLoading) return <div>Loading...</div>;

  return (
    <>
      <div style={layoutStyle.container}>
        {/* 1. Main Pipe (Left Sidebar Area) */}
        <section style={{ height: '100%' }}>
          <PipeCard
            mode="main"
            trafficData={dashboardTraffic?.summary}
            room={{
              name: '전체 대기열 통합',
            }}
            emitSignal={dashboardTraffic?.timestamp}
          />
        </section>

        {/* 2. Sub Pipes Grid (Right Area) */}
        <section style={layoutStyle.gridArea}>
          {roomList.map((room, i) => (
            <PipeCard
              key={room.roomId}
              mode="compact"
              room={room}
              trafficData={dashboardTraffic?.detail?.[room.roomId]}
              emitSignal={dashboardTraffic?.timestamp}
            />
          ))}
        </section>

        <div className="absolute bottom-20 right-20">
          <Switch isSelected={mock} onValueChange={setMock}>
            테스트데이터
          </Switch>
        </div>
      </div>
    </>
  );
}
