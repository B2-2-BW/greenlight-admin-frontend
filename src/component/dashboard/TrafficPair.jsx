import { useCallback, useEffect, useRef, useState } from 'react';
import { TrafficParticles } from './TrafficParticles';
import { Button, Card, CardBody, Chip, NumberInput } from '@heroui/react';
import { NumberUtil } from '../../util/numberUtil.js';
import { ExternalLinkIcon } from '../../icon/Icons.jsx';
import { useNavigate } from 'react-router';
import { ActionGroupClient } from '../../api/action-group/index.js';
import { ToastUtil } from '../../util/toastUtil.js';
import debounce from 'lodash/debounce';
import './TrafficPair.css';

const MAX_TRAFFIC_PER_SECOND_CHANGE_GROUP = [-10, -5, 5, 10];

const toSigedString = (val) => {
  if (val === 0) {
    return '0';
  } else if (val > 0) {
    return `+${val}`;
  } else if (val < 0) {
    return `${val}`;
  }
  return 'undefined';
};

function formatSecondsToKorean(seconds) {
  const s = Number(seconds);
  if (isNaN(s) || s < 0) {
    return '-';
  }
  if (s === 0) {
    return `즉시`;
  }
  if (s < 60) {
    return `${s}초`;
  }
  // 분 단위로만 표시 (반올림 대신 내림: 60~119초는 1분으로 표시)
  const minutes = Math.floor(s / 60);
  return `${minutes}분`;
}

const getQueueStatus = (waitTime) => {
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

const statusColorMap = {
  진입불가: { heroUi: 'default', hex: '#D4D4D8' },
  바로입장: { heroUi: 'success', hex: '#17C964' },
  폭주: { heroUi: 'danger', hex: '#F31260' },
  혼잡: { heroUi: 'warning', hex: '#F5A524' },
  원활: { heroUi: 'primary', hex: '#20814C' },
};

const getHeroUiColorFromStatus = (stat) => {
  return statusColorMap[stat] ? statusColorMap[stat].heroUi : 'default';
};

const getHexColorFromStatus = (stat) => {
  return statusColorMap[stat] ? statusColorMap[stat].hex : '#D4D4D8';
};

const QUEUE_STATUS_CHIP_SIZE = 'lg';
const QUEUE_STATUS_CHIP_CLASSES = {
  base: 'text-lg min-w-16 min-h-8 text-center',
};

const getQueueStatusChip = (stat) => {
  return (
    <Chip
      size={QUEUE_STATUS_CHIP_SIZE}
      color={getHeroUiColorFromStatus(stat)}
      variant={stat === '바로입장' ? 'flat' : 'solid'}
      classNames={QUEUE_STATUS_CHIP_CLASSES}
    >
      {stat}
    </Chip>
  );
};

export function TrafficPair({
  width = 400,
  height = 80,
  actionGroup = {},
  trafficData = {},
  backgroundColor = '#000000',
  waitingColor = '#49B3FF',
  enteredColor = '#4ADE80',
  trailAlpha = 0.12,
  onUpdateMaxTrafficPerSecond,
}) {
  const [status, setStatus] = useState('-');
  const [editMaxTrafficPerSecond, setEditMaxTrafficPerSecond] = useState(0);

  useEffect(() => {
    setEditMaxTrafficPerSecond(actionGroup?.maxTrafficPerSecond);
  }, [actionGroup]);

  useEffect(() => {
    setStatus(getQueueStatus(trafficData?.estimatedWaitTime));
  }, [actionGroup, trafficData]);

  const debouncedUpdateMaxTrafficPerSecond = useCallback(
    debounce((value) => updateMaxTrafficPerSecond(value), 500),
    []
  );

  const navigate = useNavigate();

  const navigateToActionGroupDetail = (actionGroupId) => {
    navigate(`/action-groups/${actionGroupId}`);
  };

  const onMaxTrafficPerSecondChange = async (value) => {
    setEditMaxTrafficPerSecond((prev) => Math.max(value, 0));
    debouncedUpdateMaxTrafficPerSecond(value);
  };

  const updateMaxTrafficPerSecond = async (value) => {
    if (actionGroup?.id == null) {
      ToastUtil.error('초당 유입량 변경 실패', '액션그룹이 없습니다.');
      return;
    }
    const newValue = Math.max(value, 0);
    await ActionGroupClient.updateActionGroupById(actionGroup.id, {
      maxTrafficPerSecond: newValue,
    });
    ToastUtil.success('초당 유입량 변경 성공', `초당 유입량 설정값이 저장되었습니다. 설정값: ${newValue}`);
    onUpdateMaxTrafficPerSecond();
  };

  return (
    <div className="flex gap-4 p-4 border-1 border-neutral-300 rounded-lg bg-white items-end">
      <div>
        <div className="flex flex-col gap-2 relative">
          <div className="">
            <Button className="px-2" variant="light" onPress={() => navigateToActionGroupDetail(actionGroup.id)}>
              <div className="flex gap-2 items-end">
                <span className="text-lg font-semibold">{actionGroup.name}</span>
                <div className="flex gap-1 text-neutral-600">
                  <span>{actionGroup.description}</span>
                  <ExternalLinkIcon size={16} color={'#737373'} />
                </div>
              </div>
            </Button>
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <div className="flex items-center">
            <div className="flex flex-col gap-2">
              <TrafficParticles
                actionGroupId={actionGroup.id}
                updateTrigger={trafficData?.timestamp}
                width={width}
                height={height}
                yMin={10}
                yMax={60}
                count={trafficData?.requestCount}
                particleColor={waitingColor}
                backgroundColor={backgroundColor}
                wrapperBackgroundColor={backgroundColor}
                trailAlpha={trailAlpha}
                leftTopComponent={
                  <div className="text-neutral-600">
                    실시간 요청: {NumberUtil.round(trafficData?.averageRequestCount, 1)}
                    <span className="text-xs">/초</span>
                  </div>
                }
              />
            </div>
            <div className="w-[240px] text-large rounded-l-sm rounded-r-2xl z-[2]">
              <Card
                style={{
                  // backgroundColor: getWaitingBackgroundColor(status),
                  borderColor: getHexColorFromStatus(status),
                  borderStyle: 'solid',
                  borderWidth: '1px',
                }}
              >
                <CardBody>
                  <div
                    className="flex flex-col items-center justify-center"
                    style={
                      {
                        // color: getWaitingTextColor(status),
                      }
                    }
                  >
                    <div className={'mb-1 rounded-full ' + (status === '폭주' ? 'glow-pulse' : '')}>
                      {getQueueStatusChip(status)}
                    </div>
                    <div className="text-base">
                      <span>예상: </span>
                      <span className="font-bold text-xl">{formatSecondsToKorean(trafficData?.estimatedWaitTime)}</span>
                      <span> · </span>
                      <span>대기: </span>
                      <span className="font-bold text-lg">
                        {trafficData?.waitingCount ? NumberUtil.formatNumber(trafficData?.waitingCount) : '0'}
                      </span>
                      <span>명</span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <TrafficParticles
                actionGroupId={actionGroup.id}
                updateTrigger={trafficData?.timestamp}
                width={width}
                height={height}
                yMin={20}
                yMax={50}
                count={trafficData?.enteredCount}
                particleColor={enteredColor}
                backgroundColor={backgroundColor}
                wrapperBackgroundColor={backgroundColor}
                trailAlpha={trailAlpha}
                wrapperType="ENTERED"
                rightTopComponent={
                  <div className="text-neutral-600">
                    실시간 입장: {NumberUtil.round(trafficData?.averageEnteredCount, 1)}
                    <span className="text-xs">/초</span>
                  </div>
                }
              />
            </div>
          </div>
        </div>
      </div>
      {/*<div>*/}
      {/*  <div className="mb-2">*/}
      {/*    <div className="flex flex-col items-center">*/}
      {/*      <span className="text-neutral-600">현재 활성사용자 수</span>*/}
      {/*      <span>{trafficData?.averageActiveUserCount}</span>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</div>*/}
      <div>
        <div className="mb-2">
          <span className="text-neutral-600">초당 유입량 설정</span>
        </div>
        <div className="flex rounded-xl border-1 w-[160px]">
          <Button
            isDisabled={editMaxTrafficPerSecond <= 0}
            isIconOnly
            onPress={() => onMaxTrafficPerSecondChange(editMaxTrafficPerSecond - 1)}
          >
            -
          </Button>
          <div className="grow">
            <NumberInput
              aria-label="초당 유입량"
              hideStepper
              labelPlacement="outside"
              style={{ border: 'none' }}
              variant="bordered"
              value={editMaxTrafficPerSecond}
              onValueChange={onMaxTrafficPerSecondChange}
              classNames={{ inputWrapper: 'border-0 shadow-none', input: 'text-center text-lg' }}
            />
          </div>
          <Button isIconOnly onPress={() => onMaxTrafficPerSecondChange(editMaxTrafficPerSecond + 1)}>
            +
          </Button>
        </div>
        <div className="flex gap-1 justify-between mt-1">
          {MAX_TRAFFIC_PER_SECOND_CHANGE_GROUP.map((value) => (
            <Button
              size="sm"
              key={value}
              isDisabled={editMaxTrafficPerSecond <= 0 && value < 0}
              onPress={() => onMaxTrafficPerSecondChange(editMaxTrafficPerSecond + value)}
              isIconOnly
              variant="light"
            >
              <span className="text-blue-600"> {toSigedString(value)}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
