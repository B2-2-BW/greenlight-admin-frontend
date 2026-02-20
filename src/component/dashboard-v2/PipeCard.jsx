import styles from './PipeCard.module.css';
import { Button, Chip } from '@heroui/react';
import CapacityControl from './CapacityControl.jsx';
import { DateUtil } from '../../util/dateUtil.jsx';
import { useNavigate } from 'react-router';
import Funnel2 from './Funnel2.jsx';
import Wave from './Wave.jsx';
import { useEffect, useMemo, useState } from 'react';

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
  바로입장: { labelColor: '#FFFFFF', color: '#17C964', backgroundColor: '#17C964', heroUi: 'success' },
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
    <Chip
      size="lg"
      color={getHeroUiColorFromStatus(stat)}
      variant={stat === '바로입장' ? 'flat' : 'solid'}
      classNames="text-lg min-w-16 min-h-4 text-center"
    >
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

/**
 * PipeCard
 * @param {string} mode - 'main' | 'compact' (기본값 compact)
 * @param {Object} data - 데이터 객체
 * @param {ReactNode} children - { inflow, wave, outflow } 슬롯
 */
export default function PipeCard({ mode = 'compact', room, trafficData, emitSignal }) {
  const navigate = useNavigate();
  const isMain = mode === 'main';

  const handleCapacityChange = () => {};

  const navigateToRoomDetail = (roomId) => {
    navigate(`/rooms/${roomId}`);
  };

  const inflowQuantity = trafficData?.inflowRate ? Math.ceil(trafficData.inflowRate / 50) : 0;
  const enteredQuantity = trafficData?.enteredRate ? Math.ceil(trafficData.enteredRate / 50) : 0;
  const outflowQuantity = trafficData?.outflowRate ? Math.ceil(trafficData.outflowRate / 50) : 0;
  const roomCapacityRate = trafficData?.roomCustomerCount
    ? trafficData.roomCustomerCount / trafficData.roomCapacity
    : 0;
  const queueStatus = getWaitingQueueStatus(trafficData?.estimatedWaitTime);
  const waveColor = getColorFromRoomCapacityRate(roomCapacityRate);
  const roomStatus = getRoomStatusFromCapacityRate(roomCapacityRate);

  return (
    <div className={`${styles.card} ${isMain ? styles.mainCard : styles.compactCard}`}>
      {/* 1. Header: 타이틀 & 상태 */}
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          {isMain ? (
            <div>
              {room?.name}
              {/*<span className={styles.badge}>TOTAL</span>*/}
            </div>
          ) : (
            <div className="flex items-baseline gap-1">
              <Button className="px-1" variant="light" onPress={() => navigateToRoomDetail(room.roomId)}>
                <div className="flex gap-2 items-end">
                  <span className="text-base">{room?.name}</span>
                  {/*<div className="flex gap-1 text-neutral-600">*/}
                  {/*<span>{data?.description}</span>*/}
                  {/*<ExternalLinkIcon size={16} color={'#737373'} />*/}
                  {/*</div>*/}
                </div>
              </Button>
              {queueStatus !== '-' && (
                <div className={'mb-1 rounded-full ' + (queueStatus === '폭주' ? 'glow-pulse' : '')}>
                  {getQueueStatusChip(queueStatus)}
                </div>
              )}
            </div>
          )}
        </div>
        <div>
          {!isMain && (
            <CapacityControl
              isDisabled={isMain}
              value={room?.maxCapacity} // 데이터 모델에 maxCapacity가 있어야 함
              onChange={(newMax) => handleCapacityChange(room?.roomId, newMax)}
            />
          )}
        </div>
      </div>

      <div className={styles.pipeBody}>
        {/* 2. 초당 진입 파이프 */}
        <div className={`w-full flex justify-center relative ${isMain ? 'h-[120px]' : 'h-[60px]'}`}>
          {/* 진입 속도 (Simple Label) */}
          <div className={styles.flowRateLabel} style={{ top: -10 }}>
            <span className={styles.icon}>⬇</span> {trafficData?.inflowRate}/s
          </div>
          {/* Emitter Container */}
          <div className={styles.emitterPipe}>
            <Funnel2
              className="absolute inset-0 z-20 block w-full h-full"
              emitSignal={emitSignal}
              quantity={inflowQuantity}
              straight={false}
              angle={10}
              size={{ min: 3, max: 5 }}
              speed={{ min: 2, max: 5 }}
              duration={2.5}
              delay={0.1}
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
                  {trafficData?.waitingCount?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Middle Section (Tank/Wave) */}
        <div className={`w-full flex justify-center relative ${isMain ? 'h-[80px]' : 'h-[40px]'}`}>
          <div className={styles.emitterPipe}>
            <Funnel2
              className="absolute inset-0 z-20 block w-full h-full"
              emitSignal={emitSignal}
              quantity={enteredQuantity}
              straight={true}
              size={{ min: 3, max: 3 }}
              speed={{ min: 1.5, max: 1.5 }}
              colors={['#3b82f6', '#60a5fa', '#93c5fd']}
              duration={2.5}
              delay={0.1}
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
                <span className="font-bold text-[#1e293b]" style={{ fontSize: isMain ? '1.6rem' : '1.2rem' }}>
                  {trafficData?.roomCustomerCount?.toLocaleString()}
                </span>
                <span className="font-medium text-[#64748b]" style={{ fontSize: isMain ? '0.9rem' : '0.7rem' }}>
                  / {trafficData?.roomCapacity?.toLocaleString()}
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
        <div className={`w-full flex justify-center relative ${isMain ? 'h-[120px]' : 'h-[80px]'}`}>
          <div className={styles.emitterPipe}>
            <Funnel2
              className="absolute inset-0 z-20 block w-full h-full"
              emitSignal={emitSignal}
              quantity={outflowQuantity}
              straight={false}
              angle={10}
              size={{ min: 2, max: 3 }}
              speed={{ min: 2, max: 3 }}
              duration={2.5}
              delay={0.1}
              emitWidth={20}
            />
          </div>

          {/* 이탈 속도 (Simple Label) */}
          <div className={styles.flowRateLabel} style={{ bottom: -5 }}>
            <span className={styles.icon}>⬇</span> {trafficData?.outflowRate}/s
          </div>
        </div>
      </div>
    </div>
  );
}
