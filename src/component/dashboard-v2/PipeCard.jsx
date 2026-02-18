import styles from './PipeCard.module.css';
import { Button, Chip } from '@heroui/react';
import CapacityControl from './CapacityControl.jsx';
import { DateUtil } from '../../util/dateUtil.jsx';

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
/**
 * PipeCard
 * @param {string} mode - 'main' | 'compact' (기본값 compact)
 * @param {Object} data - 데이터 객체
 * @param {ReactNode} children - { inflow, wave, outflow } 슬롯
 */
export default function PipeCard({
  mode = 'compact',
  data,
  inflowComponent,
  enteredComponent,
  waveComponent,
  outflowComponent,
}) {
  const isMain = mode === 'main';

  const handleCapacityChange = () => {};

  return (
    <div className={`${styles.card} ${isMain ? styles.mainCard : styles.compactCard}`}>
      {/* 1. Header: 타이틀 & 상태 */}
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          {isMain ? (
            <div>
              {data?.name}
              {/*<span className={styles.badge}>TOTAL</span>*/}
            </div>
          ) : (
            <div className="flex items-baseline">
              <Button className="px-1" variant="light" onPress={() => navigateToActionGroupDetail(actionGroup.id)}>
                <div className="flex gap-2 items-end">
                  <span className="text-base">{data?.name}</span>
                  <div className="flex gap-1 text-neutral-600">
                    {/*<span>{data?.description}</span>*/}
                    {/*<ExternalLinkIcon size={16} color={'#737373'} />*/}
                  </div>
                </div>
              </Button>
              <div className={'mb-1 rounded-full ' + (data?.waitingStatus === '폭주' ? 'glow-pulse' : '')}>
                {getQueueStatusChip(data?.waitingStatus)}
              </div>
            </div>
          )}
        </div>
        <div>
          {!isMain && (
            <CapacityControl
              isDisabled={isMain}
              value={data.maxCapacity} // 데이터 모델에 maxCapacity가 있어야 함
              onChange={(newMax) => handleCapacityChange(data.id, newMax)}
            />
          )}
        </div>
      </div>

      <div className={styles.pipeBody}>
        {/* 2. 초당 진입 파이프 */}
        <div className={`w-full flex justify-center relative ${isMain ? 'h-[120px]' : 'h-[60px]'}`}>
          {/* 진입 속도 (Simple Label) */}
          <div className={styles.flowRateLabel} style={{ top: -10 }}>
            <span className={styles.icon}>⬇</span> {data.inflowRate}/s
          </div>
          {/* Emitter Container */}
          <div className={styles.emitterPipe}>{inflowComponent}</div>
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
                  style={{ color: statusColorMap[data?.waitingStatus]?.color }}
                >
                  {DateUtil.toMMSS(data.expectedWait)}
                </span>
              </div>
              <div>
                <span>대기</span>
                <span className={`ml-1 font-bold ${isMain ? 'text-lg' : 'text-base'}`}>
                  {data?.waitingCount?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Middle Section (Tank/Wave) */}
        <div className={`w-full flex justify-center relative ${isMain ? 'h-[80px]' : 'h-[40px]'}`}>
          <div className={styles.emitterPipe}>{enteredComponent}</div>
        </div>

        {/* 5. Room Section (Tank/Wave) */}
        <div className={styles.middleSection}>
          <div className={`${styles.tankContainer} ${isMain ? styles.mainTankContainer : ''}`}>
            {/* Wave Component */}
            <div className={styles.waveWrapper}>{waveComponent}</div>

            {/* Center Overlay */}
            <div className={styles.tankOverlay}>
              {/* 현재수 / 최대수 라인 */}
              <div className="flex items-baseline justify-center gap-1 tabular-nums">
                <span className="font-bold text-[#1e293b]" style={{ fontSize: isMain ? '1.6rem' : '1.2rem' }}>
                  {data?.currentUsers?.toLocaleString()}
                </span>
                <span className="font-medium text-[#64748b]" style={{ fontSize: isMain ? '0.9rem' : '0.7rem' }}>
                  / {data?.maxCapacity?.toLocaleString()}
                </span>
              </div>

              {/* 수용률 라인 */}
              <div className="flex items-center justify-center mt-1">
                <span
                  className="px-2 py-0.5 rounded-full font-medium"
                  style={{
                    fontSize: isMain ? '0.9rem' : '0.7rem',
                    backgroundColor: statusColorMap[data?.roomStatus]?.backgroundColor,
                    color: statusColorMap[data?.roomStatus]?.labelColor,
                  }}
                >
                  {Math.round(data?.capacityRate * 100)}% Full
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 6. Bottom Section (Outflow) */}
        <div className={`w-full flex justify-center relative ${isMain ? 'h-[120px]' : 'h-[80px]'}`}>
          <div className={styles.emitterPipe}>{outflowComponent}</div>

          {/* 이탈 속도 (Simple Label) */}
          <div className={styles.flowRateLabel} style={{ bottom: -5 }}>
            <span className={styles.icon}>⬇</span> {data.outflowRate}/s
          </div>
        </div>
      </div>
    </div>
  );
}
