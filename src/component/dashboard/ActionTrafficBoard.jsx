import { TrafficPair } from './TrafficPair';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActionGroupClient } from '../../api/action-group/index.js';
import { Button, Skeleton } from '@heroui/react';
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

  const [isDataLoading, setIsDataLoading] = useState(true);

  const [actionGroups, setActionGroups] = useState([]);
  const [trafficDetail, setTrafficDetail] = useState({});
  const [trafficSummary, setTrafficSummary] = useState({});

  const esRef = useRef(null);

  const onTick = useCallback((event) => {
    try {
      const parsed = JSON.parse(event.data);
      setTrafficDetail(parsed?.detail);
      setTrafficSummary(parsed?.summary);
      if (isDataLoading === true) {
        setIsDataLoading(false);
      }
    } catch (error) {
      console.error(error);
    }
  }, []); // setTrafficData가 외부 state면 필요 시 useCallback 내부 deps 조정

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

    es.addEventListener('tick', onTick);

    es.onerror = (err) => {
      // 네트워크/서버 오류 발생 시
      // 기본적으로 EventSource는 자동 재연결을 시도한다
      // 필요시 es.close()로 수동 종료 가능
      console.log(`SSE error: '${err?.error}'. readyState=${es.readyState}. Will auto-reconnect if supported.`);
      setIsDataLoading(true);
    };

    return () => {
      try {
        es.removeEventListener('tick', onTick); // 동일 레퍼런스로 제거
      } catch {
        /* ignored */
      }
      es.close();
      if (esRef.current === es) {
        esRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    fetchActionGroupList();
  }, [onTick]);

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
        <div className="flex items-end gap-4">
          <span className="mt-2 text-xl font-bold">고객 트래픽 요약</span>
          {/*<span>기준시간: {DateUtil.timestampToDateTime(trafficDetail[0]?.timestamp)}</span>*/}
        </div>
        <TrafficSummary isLoading={isDataLoading} trafficSummary={trafficSummary} />
      </div>
      <div>
        <div className="text-xl font-bold">액션 그룹별 현황</div>
        <div className="mt-2 w-[1000px] flex flex-col gap-4">
          {actionGroups.map((actionGroup) => (
            <div key={actionGroup.id} className="flex">
              <Skeleton className="rounded-lg w-full" isLoaded={!isPageLoading}>
                <TrafficPair
                  actionGroup={actionGroup}
                  trafficData={trafficDetail[actionGroup.id]}
                  width={280}
                  height={70}
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
