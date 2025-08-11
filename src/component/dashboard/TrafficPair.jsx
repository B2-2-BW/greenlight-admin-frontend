import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TrafficParticles } from './TrafficParticles';
import {
  Button,
  Card,
  CardBody,
  Input,
  NumberInput,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react';
import { NumberUtil } from '../../util/numberUtil.js';
import { ExternalLinkIcon } from '../../icon/Icons.jsx';
import { useNavigate } from 'react-router';
import { ActionGroupClient } from '../../api/action-group/index.js';
import { ToastUtil } from '../../util/toastUtil.js';
import debounce from 'lodash/debounce';

function getWaitingStatus(maxActiveCustomers, waitingCount) {
  if (maxActiveCustomers == null || waitingCount == null) {
    return '-';
  } else if (maxActiveCustomers <= 0) {
    return '진입불가';
  } else if (waitingCount / maxActiveCustomers < 0.3) {
    return '원활';
  } else if (waitingCount / maxActiveCustomers <= 1) {
    return '대기 ';
  }
  return '혼잡';
}
function getWaitingBackgroundColor(status) {
  if (status === '혼잡') {
    return '#FF3838';
  } else if (status === '원활') {
    return '#04B34F';
  } else if (status === '대기') {
    return '#FFB302';
  }
  return '#c2c2c2';
}

function getWaitingTextColor(status) {
  if (status === '혼잡') {
    return '#ffffff';
  } else if (status === '원활') {
    return '#ffffff';
  } else if (status === '대기') {
    return '#ffffff';
  }
  return '#000000';
}

const MAX_ACTIVE_CUSTOMERS_CHANGE_GROUP = [-10, -5, 5, 10];

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

export function TrafficPair({
  width = 400,
  height = 80,
  actionGroup = {},
  trafficData = {},
  backgroundColor = '#000000',
  waitingColor = '#49B3FF',
  enteredColor = '#4ADE80',
  trailAlpha = 0.12,
  onUpdateMaxActiveCustomers,
}) {
  const status = useRef(null);
  const [editMaxActiveCustomers, setEditMaxActiveCustomers] = useState(0);

  useEffect(() => {
    setEditMaxActiveCustomers(actionGroup?.maxActiveCustomers);
  }, [actionGroup]);

  useEffect(() => {
    status.current = getWaitingStatus(actionGroup?.maxActiveCustomers, trafficData?.waitingCount);
  }, [actionGroup, trafficData]);

  const debouncedUpdateMaxActiveCustomers = useCallback(
    debounce((value) => updateMaxActiveCustomers(value), 500),
    []
  );

  const navigate = useNavigate();

  const navigateToActionGroupDetail = (actionGroupId) => {
    navigate(`/action-groups/${actionGroupId}`);
  };

  const onMaxActiveCustomersChange = async (value) => {
    setEditMaxActiveCustomers((prev) => Math.max(value, 0));
    debouncedUpdateMaxActiveCustomers(value);
  };

  const updateMaxActiveCustomers = async (value) => {
    if (actionGroup?.id == null) {
      ToastUtil.error('활성사용자수 변경 실패', '액션그룹이 없습니다.');
      return;
    }
    const newValue = Math.max(value, 0);
    await ActionGroupClient.updateActionGroupById(actionGroup.id, {
      maxActiveCustomers: newValue,
    });
    await ActionGroupClient.invalidateCoreActionGroupCache(actionGroup.id);
    ToastUtil.success('활성사용자수 변경 성공', `최대 활성사용자수 설정값이 저장되었습니다. 설정값: ${newValue}`);
    onUpdateMaxActiveCustomers();
  };

  return (
    <div className="flex gap-2 p-4 border-1 rounded-lg bg-white items-end">
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
                height={80}
                wrapperHeight={80}
                yMin={10}
                yMax={50}
                count={trafficData?.requestCount}
                particleColor={waitingColor}
                backgroundColor={backgroundColor}
                wrapperBackgroundColor={backgroundColor}
                trailAlpha={trailAlpha}
                leftBottomComponent={trafficData?.requestCount}
              />
            </div>
            <div className="w-32 text-large rounded-l-sm rounded-r-2xl bg-neutral-100">
              <Card
                style={{
                  backgroundColor: getWaitingBackgroundColor(status.current),
                }}
              >
                <CardBody>
                  <div
                    className="flex flex-col items-center justify-center"
                    style={{
                      color: getWaitingTextColor(status.current),
                    }}
                  >
                    <span className="text-xl">{status.current}</span>
                    <div>
                      <span className="text-sm leading-none mr-1"> 대기인원:</span>
                      <span className="text-lg leading-3">
                        {trafficData?.waitingCount ? NumberUtil.formatNumber(trafficData?.waitingCount) : '0'}
                      </span>
                      <span className="text-sm">명</span>
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
                height={80}
                wrapperHeight={80}
                yMin={7}
                yMax={23}
                count={trafficData?.enteredCount}
                particleColor={enteredColor}
                backgroundColor={backgroundColor}
                wrapperBackgroundColor={backgroundColor}
                trailAlpha={trailAlpha}
                wrapperType="ENTERED"
                rightBottomComponent={trafficData?.enteredCount}
              />
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="mb-2">
          <span className="text-neutral-600">최대 활성사용자 수</span>
        </div>
        <div className="flex rounded-xl border-1 w-[160px]">
          <Button
            isDisabled={editMaxActiveCustomers <= 0}
            isIconOnly
            onPress={() => onMaxActiveCustomersChange(editMaxActiveCustomers - 1)}
          >
            -
          </Button>
          <div className="grow">
            <NumberInput
              aria-label="최대 활성사용자수"
              hideStepper
              labelPlacement="outside"
              style={{ border: 'none' }}
              variant="bordered"
              value={editMaxActiveCustomers}
              onValueChange={onMaxActiveCustomersChange}
              classNames={{ inputWrapper: 'border-0 shadow-none', input: 'text-center text-lg' }}
            />
          </div>
          <Button isIconOnly onPress={() => onMaxActiveCustomersChange(editMaxActiveCustomers + 1)}>
            +
          </Button>
        </div>
        <div className="flex gap-1 justify-between mt-1">
          {MAX_ACTIVE_CUSTOMERS_CHANGE_GROUP.map((value) => (
            <Button
              size="sm"
              key={value}
              isDisabled={editMaxActiveCustomers <= 0 && value < 0}
              onPress={() => onMaxActiveCustomersChange(editMaxActiveCustomers + value)}
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
