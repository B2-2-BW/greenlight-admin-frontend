import { TrafficPair } from './TrafficPair';
import React, { useEffect, useRef, useState } from 'react';
import { ActionGroupClient } from '../../api/action-group/index.js';
import { Skeleton } from '@heroui/react';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { LoginUtil } from '../../util/loginUtil.js';
import { BASE_EXTERNAL_URL } from '../../client/config.js';
import TrafficSummary from './TrafficSummary.jsx';
import { ToastUtil } from '../../util/toastUtil.js';

/**
 * props:
 *  - data: [{ actionId, waitingCount, enteredCount }]
 */

export function ActionTrafficBoard() {
  const [isPageLoading, setIsPageLoading] = useState(true);

  const [actionGroups, setActionGroups] = useState([]);
  const [trafficData, setTrafficData] = useState({});

  const esRef = useRef(null);

  useEffect(() => {
    const es = new EventSourcePolyfill(`${BASE_EXTERNAL_URL}/action-events/traffic/sse/stream?clientId=admin`, {
      headers: {
        Authorization: `Bearer ${LoginUtil.getToken()}`,
      },
    });
    esRef.current = es;

    es.onopen = () => {
      // 연결 성공
      console.log('Traffic SSE connected');
    };
    const onTick = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        setTrafficData(parsed);
      } catch (error) {
        console.error(error);
      }
    };

    es.addEventListener('tick', onTick);

    es.onerror = (err) => {
      // 네트워크/서버 오류 발생 시
      // 기본적으로 EventSource는 자동 재연결을 시도한다
      // 필요시 es.close()로 수동 종료 가능
      console.log(`SSE closed with reason: '${err?.error}'. Trying to Reconnect...`);
    };

    return () => {
      es.close();
    };
  }, []);

  useEffect(() => {
    fetchActionGroupList();
  }, []);

  const fetchActionGroupList = async () => {
    setIsPageLoading(true);
    try {
      const data = await ActionGroupClient.getActionGroupList({ enabled: true });
      setActionGroups(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      ToastUtil.error('대시보드 로딩 실패', '대시보드를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.');
      setActionGroups([]);
    } finally {
      setIsPageLoading(false);
    }
  };
  const onUpdateMaxActiveCustomers = async () => {
    await fetchActionGroupList();
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="mt-2 text-xl font-bold">고객 트래픽 요약</div>
        <TrafficSummary activeCustomerCount={0} trafficSummary={trafficData[0]} />
      </div>
      <div>
        <div className="text-xl font-bold">액션 그룹별 현황</div>
        <div className="mt-2 w-[968px]  flex flex-col gap-4">
          {actionGroups.map((actionGroup) => (
            <div key={actionGroup.id} className="flex">
              <Skeleton className="rounded-lg w-full" isLoaded={!isPageLoading}>
                <TrafficPair
                  actionGroup={actionGroup}
                  trafficData={trafficData[actionGroup.id]}
                  width={300}
                  height={80}
                  backgroundColor={'#f6f6f6'}
                  onUpdateMaxActiveCustomers={onUpdateMaxActiveCustomers}
                />
              </Skeleton>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
