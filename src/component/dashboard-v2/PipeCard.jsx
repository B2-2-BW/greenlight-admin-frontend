import styles from './PipeCard.module.css';
import { Button, Chip, Tooltip } from '@heroui/react';
import QuickSetting from './QuickSetting.jsx';
import { DateUtil } from '../../util/dateUtil.jsx';
import { useNavigate } from 'react-router';
import Funnel2 from './Funnel2.jsx';
import Wave from './Wave.jsx';

const getCapacityLabelBackgroundColor = (status) => {
  switch (status) {
    case '폭주':
      return '';
    case '혼잡':
      return '';
    case '원활':
      return '';
    default:
      return '';
  }
};

const getColorFromRoomCapacityRate = (rate) => {
  if (rate == null || isNaN(rate)) {
    return '#DCDCDCAA';
  }
  if (rate >= 0.8) {
    return '#FF0000AA';
  } else if (rate >= 0.4) {
    return '#FFA500AA';
  } else {
    return '#00AA00AA';
  }
};

const statusColorMap = {
  진입불가: { labelColor: '#FFFFFF', color: '#D4D4D8', backgroundColor: '#D4D4D8', heroUi: 'default' },
  바로입장: { labelColor: '#FFFFFF', color: '#089345', backgroundColor: '#089345', heroUi: 'success' },
  폭주: { labelColor: '#FFFFFF', color: '#ea0052', backgroundColor: '#ea0052', heroUi: 'danger' },
  혼잡: { labelColor: '#000000', color: '#ec7d00', backgroundColor: '#F5A524', heroUi: 'warning' },
  원활: { labelColor: '#FFFFFF', color: '#20814C', backgroundColor: '#20814C', heroUi: 'primary' },
};
const getHeroUiColorFromStatus = (stat) => {
  return statusColorMap[stat] ? statusColorMap[stat].heroUi : 'default';
};

const getHexColorFromStatus = (stat) => {
  return statusColorMap[stat] ? statusColorMap[stat].hex : '#D4D4D8';
};

const getQueueStatusChip = (stat) => {
  return (
    <Chip size="lg" color={getHeroUiColorFromStatus(stat)} variant="soft" className="min-w-16 min-h-4 text-center">
      {stat}
    </Chip>
  );
};

const getWaitingQueueStatus = (waitTime) => {
  if (waitTime < 0) {
    return '진입불가';
  }
  if (waitTime >= 600) {
    return '폭주';
  } else if (waitTime >= 10) {
    return '혼잡';
  } else if (waitTime > 0) {
    return '원활';
  } else if (waitTime === 0) {
    return '바로입장';
  } else {
    return '-';
  }
};

const getRoomStatusFromCapacityRate = (rate) => {
  if (rate >= 0.8) {
    return '폭주';
  } else if (rate >= 0.4) {
    return '혼잡';
  } else {
    return '원활';
  }
};

const calculateFunnelParam = (n) => {
  // N < 30
  if (n < 30) {
    return {
      quantity: 1,
      duration: n / 10,
      delay: 0.1,
    };
  }

  if (n > 150) {
    return {
      quantity: 5,
      duration: 3,
      delay: 0.1,
    };
  }
  // N >= 30
  const duration = 3;

  // N이 30으로 딱딱 떨어지면 delay=0.1 고정
  if (n % 30 === 0) {
    return {
      quantity: n / 30,
      duration,
      delay: 0.1,
    };
  }

  // 그 외: delay를 조절하되 0.1에 가장 가깝게 quantity 선택
  const qFloor = Math.max(1, Math.floor(n / 30));
  const qCeil = Math.max(1, Math.ceil(n / 30));

  const delayFloor = (qFloor * duration) / n;
  const delayCeil = (qCeil * duration) / n;

  const pickFloor = Math.abs(delayFloor - 0.1) <= Math.abs(delayCeil - 0.1);
  const quantity = pickFloor ? qFloor : qCeil;
  const delay = (quantity * duration) / n;

  return { quantity, duration, delay };
};

/**
 * PipeCard
 * @param {string} mode - 'main' | 'compact' (기본값 compact)
 * @param {Object} data - 데이터 객체
 * @param {ReactNode} children - { inflow, wave, outflow } 슬롯
 */
export default function PipeCard({ mode = 'compact', room, trafficData, emitSignal }) {
  const navigate = useNavigate();
  const isMain = mode === 'main';

  const navigateToRoomDetail = (roomId) => {
    navigate(`/rooms/${roomId}`);
  };

  const waitingCount = calculateFunnelParam(trafficData?.waitingCount);
  const enteredCount = calculateFunnelParam(trafficData?.enteredCount);
  const exitedCount = calculateFunnelParam(trafficData?.exitedCount);
  exitedCount.quantity *= 2;
  exitedCount.duration /= 2;

  const roomCapacityRate = trafficData?.totalActive ? trafficData.totalActive / room.capacity : 0;

  const queueStatus = getWaitingQueueStatus(trafficData?.estimatedWaitTime);
  const waveColor = getColorFromRoomCapacityRate(roomCapacityRate);
  const roomStatus = getRoomStatusFromCapacityRate(roomCapacityRate);

  return (
    <div
      className={`rounded-xl bg-white flex flex-col shadow-background-secondary shadow-lg relative transition-transform ${isMain ? 'border-accent h-[400px] min-h-[400px] md:h-full md:min-h-[656px] border-2' : 'border-neutral-200 h-[400px] min-w-0 w-full border'}`}
    >
      <div className="p-2 flex justify-between items-center gap-2 border-b w-full">
        {/* 좌측 영역: 이름 + 상태 칩 */}
        <div className="flex items-center min-w-0 flex-1">
          {isMain ? (
            <div className="truncate text-base">{room?.name}</div>
          ) : (
            // 2. Room name과 Chip을 붙이기 위해 gap-1.5 사용, 자식 요소 말줄임을 위해 min-w-0 필수
            <div className="flex items-baseline gap-1.5 min-w-0 w-full">
              {/* 4 & 5. 말줄임표(ellipse) 처리 및 Tooltip 적용 */}
              <Tooltip showArrow={true} delay={100}>
                <Button
                  className="shrink min-w-0 px-1 justify-start h-auto py-1"
                  variant="ghost"
                  onPress={() => navigateToRoomDetail(room.roomId)}
                >
                  <span className="text-base truncate block w-full text-left px-1">{room?.name}</span>
                </Button>
                <Tooltip.Content className="text-base">{room?.name}</Tooltip.Content>
              </Tooltip>

              {/* 2. 상태 칩 영역 (shrink-0으로 공간 찌그러짐 방지) */}

              <div className={`shrink-0 mb-1 min-w-18 rounded-full ${queueStatus === '폭주' ? 'glow-pulse' : ''}`}>
                {queueStatus !== '-' && getQueueStatusChip(queueStatus)}
              </div>
            </div>
          )}
        </div>

        {/* 3. 우측 기어 버튼 (shrink-0으로 가장 우측 공간 고정 확보) */}
        <div className="shrink-0">{!isMain && <QuickSetting room={room} />}</div>
      </div>

      <div className={styles.pipeBody}>
        {/* 2. 초당 진입 파이프 */}
        <div className={`w-full flex justify-center relative ${isMain ? 'h-[60px] md:h-[120px]' : 'h-[60px]'}`}>
          {/* 진입 속도 (Simple Label) */}
          <div className={styles.flowRateLabel} style={{ top: -10 }}>
            <span className={styles.icon}>⬇</span> {trafficData?.waitingRate.toFixed(1)}/s
          </div>
          {/* Emitter Container */}
          <div className={styles.emitterPipe}>
            <Funnel2
              className="absolute inset-0 z-20 block w-full h-full"
              emitSignal={emitSignal}
              {...waitingCount}
              straight={false}
              angle={10}
              size={{ min: 3, max: 5 }}
              speed={{ min: 2, max: 5 }}
              colors={['#3b82f6', '#60a5fa', '#93c5fd']}
              emitWidth={20}
            />
          </div>
        </div>

        {/* 3. 대기중인 고객 수 */}
        <div className="flex w-full justify-center">
          <div className="rounded-[20px] min-w-[140px] border border-[#cbd5e1]">
            {/* 현재수 / 최대수 라인 */}
            <div
              className={`py-1 px-2 w-full flex flex-col text-neutral-600 whitespace-nowrap items-center justify-center tabular-nums ${isMain ? 'text-sm' : 'text-xs'}`}
            >
              <div>
                <span>예상</span>
                <span
                  className={`ml-1 font-bold ${isMain ? 'text-lg' : 'text-base'}`}
                  style={{ color: statusColorMap[queueStatus]?.color }}
                >
                  {DateUtil.toMMSS(trafficData?.estimatedWaitTime)}
                </span>
              </div>
              <div>
                <span>대기</span>
                <span className={`ml-1 font-bold ${isMain ? 'text-lg' : 'text-base'}`}>
                  {trafficData?.totalWaiting?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Middle Section (Tank/Wave) */}
        <div className={`w-full flex justify-center relative ${isMain ? 'h-[40px] md:h-[80px]' : 'h-[40px]'}`}>
          <div className={styles.emitterPipe}>
            <Funnel2
              className="absolute inset-0 z-20 block w-full h-full"
              emitSignal={emitSignal}
              {...enteredCount}
              straight={true}
              size={{ min: 3, max: 3 }}
              speed={{ min: 1.5, max: 1.5 }}
              colors={['#3b82f6', '#60a5fa', '#93c5fd']}
              emitWidth={0}
            />
          </div>
        </div>

        {/* 5. Room Section (Tank/Wave) */}
        <div className={styles.middleSection}>
          <div className={`${styles.tankContainer} ${isMain ? styles.mainTankContainer : ''}`}>
            {/* Wave Component */}
            <div className={styles.waveWrapper}>
              <Wave color={waveColor} height={roomCapacityRate * 100} amplitude={1.5} speed={0.03} />
            </div>

            {/* Center Overlay */}
            <div className={styles.tankOverlay}>
              {/* 현재수 / 최대수 라인 */}
              <div className="flex items-baseline justify-center gap-1 tabular-nums">
                <span className="font-bold text-[#1e293b]" style={{ fontSize: isMain ? '1.7rem' : '1.4rem' }}>
                  {trafficData?.totalActive?.toLocaleString()}
                </span>
                <span className="font-medium text-[#64748b]" style={{ fontSize: isMain ? '1.2rem' : '1rem' }}>
                  / {room.capacity?.toLocaleString()}
                </span>
              </div>

              {/* 수용률 라인 */}
              <div className="flex items-center justify-center mt-1">
                <span
                  className="px-2 py-0.5 rounded-full font-medium"
                  style={{
                    fontSize: isMain ? '0.9rem' : '0.7rem',
                    backgroundColor: statusColorMap[roomStatus]?.backgroundColor,
                    color: statusColorMap[roomStatus]?.labelColor,
                  }}
                >
                  {Math.round(roomCapacityRate * 100)}% Full
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 6. Bottom Section (Outflow) */}
        <div className={`w-full flex justify-center relative ${isMain ? 'h-[80px] md:h-[120px]' : 'h-[80px]'}`}>
          <div className={styles.emitterPipe}>
            <Funnel2
              className="absolute inset-0 z-20 block w-full h-full"
              emitSignal={emitSignal}
              {...exitedCount}
              straight={false}
              angle={10}
              size={{ min: 2, max: 3 }}
              speed={{ min: 2, max: 3 }}
              emitWidth={20}
            />
          </div>

          {/* 이탈 속도 (Simple Label) */}
          <div className={styles.flowRateLabel} style={{ bottom: -5 }}>
            <span className={styles.icon}>⬇</span> {trafficData?.exitedRate.toFixed(1)}/s
          </div>
        </div>
      </div>
    </div>
  );
}
