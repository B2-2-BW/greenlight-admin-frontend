import { useEffect, useState } from 'react';
import Funnel2 from '../component/dashboard-v2/Funnel2.jsx';
import PipeCard from '../component/dashboard-v2/PipeCard.jsx';
import Wave from '../component/dashboard-v2/Wave.jsx';
import { Button } from '@heroui/react';

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

const getRoomStatus = (rate) => {
  if (rate >= 0.8) {
    return '폭주';
  } else if (rate >= 0.4) {
    return '혼잡';
  } else {
    return '원활';
  }
};

const getWaitingStatus = (rate) => {
  if (rate >= 600) {
    return '폭주';
  } else if (rate >= 60) {
    return '혼잡';
  } else {
    return '원활';
  }
};

export default function DashboardV2Page() {
  const [mainData, setMainData] = useState(null);
  const [subDataList, setSubDataList] = useState([]);

  const [emitSignal, setEmitSignal] = useState(null);

  const [inflowOptions, setInflowOptions] = useState([]);
  const [enteredOptions, setEnteredOptions] = useState([]);
  const [outflowOptions, setOutflowOptions] = useState([]);
  const [waveOptions, setWaveOptions] = useState([]);

  const simulate = () => {
    setEmitSignal((v) => v + 1);

    const waves = [];
    const inflow = [];
    const entered = [];
    const outflow = [];
    const mockList = Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      name: `서비스 구역 ${i + 1}`,
      description: `서비스 구역 상세`,
      waitingCount: Math.floor(Math.random() * 2000),
      inflowRate: Math.floor(Math.random() * 120),
      maxCapacity: 3000,
      currentUsers: Math.floor(Math.random() * 3000),
      outflowRate: Math.floor(Math.random() * 80),
      status: 'LIVE',
    }));
    for (let i = 0; i < mockList.length; i++) {
      const rate = mockList[i].currentUsers / mockList[i].maxCapacity;
      mockList[i].capacityRate = rate;
      mockList[i].roomStatus = getRoomStatus(rate);
      const expectedWaitTime = Math.round(mockList[i].waitingCount / Math.max(mockList[i].outflowRate, 1));
      mockList[i].expectedWait = expectedWaitTime;
      mockList[i].waitingStatus = getWaitingStatus(expectedWaitTime);
      waves.push({
        height: rate * 100,
      });
    }

    for (let i = 0; i < subDataList.length; i++) {
      inflow.push({
        quantity: Math.ceil(mockList[i].inflowRate / 50),
        duration: 2.5,
        delay: 0.1,
      });
      entered.push({
        quantity: Math.ceil(mockList[i].outflowRate / 50),
        duration: 2.5,
        delay: 0.1,
      });
      outflow.push({
        quantity: Math.ceil(mockList[i].outflowRate / 5),
        duration: 0.5,
        delay: 0.1,
      });
    }

    setSubDataList(mockList);
    setInflowOptions(inflow);
    setEnteredOptions(entered);
    setOutflowOptions(outflow);
    setWaveOptions(waves);
  };

  useEffect(() => {
    // API Call Logic Here...
    // 예시 데이터 생성
    setMainData({
      name: '전체 대기열 통합',
      waitingCount: 12540,
      expectedWait: 200,
      inflowRate: 1200,
      maxCapacity: 22000,
      currentUsers: 14000,
      outflowRate: 1150,
      capacityRate: 0.7,
      roomStatus: '원활',
      waitingStatus: '혼잡',
      status: 'LIVE',
    });
  }, []);

  if (!mainData) return <div>Loading...</div>;

  return (
    <>
      <div className="absolute z-100">
        <Button onPress={simulate}></Button>
      </div>
      <div style={layoutStyle.container}>
        {/* 1. Main Pipe (Left Sidebar Area) */}
        <section style={{ height: '100%' }}>
          <PipeCard
            mode="main"
            data={mainData}
            inflowComponent={
              <Funnel2
                className="absolute inset-0 z-20 block w-full h-full"
                emitSignal={emitSignal}
                {...inflowOptions}
                straight={false}
                angle={10}
                size={{ min: 3, max: 5 }}
                speed={{ min: 2, max: 5 }}
                colors={['#3b82f6', '#60a5fa', '#93c5fd']}
                destroyYRatio={0.92}
                emitWidth={20}
              />
            }
            waveComponent={<Wave {...waveOptions} amplitude={0.8} speed={0.03} />}
            outflowComponent={
              <Funnel2
                className="absolute inset-0 z-20 block w-full h-full"
                emitSignal={emitSignal}
                {...outflowOptions}
                straight={false}
                angle={10}
                size={{ min: 3, max: 5 }}
                speed={{ min: 2, max: 5 }}
                colors={['#3b82f6', '#60a5fa', '#93c5fd']}
                destroyYRatio={0.92}
                emitWidth={20}
              />
            }
          />
        </section>

        {/* 2. Sub Pipes Grid (Right Area) */}
        <section style={layoutStyle.gridArea}>
          {subDataList.map((item, i) => (
            <PipeCard
              key={item.id}
              mode="compact"
              data={item}
              inflowComponent={
                <Funnel2
                  className="absolute inset-0 z-20 block w-full h-full"
                  emitSignal={emitSignal}
                  {...inflowOptions[i]}
                  straight={false}
                  angle={20}
                  size={{ min: 3, max: 5 }}
                  speed={{ min: 2, max: 5 }}
                  colors={['#3b82f6', '#60a5fa', '#93c5fd']}
                  destroyYRatio={0.99}
                  emitWidth={30}
                />
              }
              enteredComponent={
                <Funnel2
                  className="absolute inset-0 z-20 block w-full h-full"
                  emitSignal={emitSignal}
                  {...inflowOptions[i]}
                  straight={true}
                  size={{ min: 3, max: 3 }}
                  speed={{ min: 1.5, max: 1.5 }}
                  colors={['#3b82f6', '#60a5fa', '#93c5fd']}
                  destroyYRatio={0.92}
                  emitWidth={0}
                />
              }
              waveComponent={
                <Wave roomStatus={subDataList[i].roomStatus} {...waveOptions[i]} amplitude={1.5} speed={0.03} />
              }
              outflowComponent={
                <Funnel2
                  className="absolute inset-0 z-20 block w-full h-full"
                  emitSignal={emitSignal}
                  {...outflowOptions[i]}
                  straight={false}
                  angle={10}
                  size={{ min: 2, max: 3 }}
                  speed={{ min: 2, max: 3 }}
                  destroyYRatio={0.92}
                  emitWidth={20}
                />
              }
            />
          ))}
        </section>
      </div>
    </>
  );
}
