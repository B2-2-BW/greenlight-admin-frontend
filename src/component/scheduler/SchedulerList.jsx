import { Card, Skeleton, Switch } from '@heroui/react';
import { useEffect, useState } from 'react';
import { SchedulerClient } from '../../api/scheduler/index.js';
import { ToastUtil } from '../../util/toastUtil.js';

const schedulerDescription = {
  relocation: { title: 'relocation', name: '입장 스케쥴러', description: '실시간 고객 입장처리' },
  capacity: { title: 'capacity', name: '활성사용자 스케쥴러', description: '실시간 활성사용자 수 계산' },
  cleanup_session: { title: 'cleanup session', name: '세션 스케쥴러', description: '실시간 세션 계산 및 정리' },
  redis_cleanup: {
    title: 'redis cleanup',
    name: '액션이벤트 정리 스케쥴러',
    description: '엑션 이벤트 발생 로그 정리',
  },
  metric: { title: 'metric', name: '액션그룹 현황 기록 스케쥴러', description: '액션그룹별 대기/입장인원 기록' },
};

function isRunning(status) {
  return status === 'RUNNING';
}

function SchedulerCard({ scheduler, updateStatus, isUpdateLoading }) {
  const [running, setRunning] = useState(false);
  useEffect(() => {
    setRunning(isRunning(scheduler.status));
  }, [scheduler]);
  return (
    <Card className="py-4">
      <Card.Header className="pb-0 pt-2 px-4 flex-col items-start">
        <p className="text-xs uppercase font-bold">{schedulerDescription[scheduler.schedulerType].title}</p>
        <small className="text-neutral-500">{schedulerDescription[scheduler.schedulerType].description}</small>
        <h4 className="font-semibold text-lg">{schedulerDescription[scheduler.schedulerType].name}</h4>
      </Card.Header>
      <Card.Content className="overflow-visible p-4">
        <div className="min-w-0">
          <Switch
            isDisabled={isUpdateLoading}
            isSelected={running}
            onChange={(newValue) => {
              updateStatus(scheduler.schedulerType, newValue);
            }}
            className="group w-full max-w-md"
          >
            <Switch.Content className="flex min-h-14 w-full flex-row-reverse items-center justify-between gap-2 rounded-lg border-2 border-default bg-content1 p-4 hover:bg-surface-hove group-data-[selected=true]:border-accent">
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
              <span className="flex min-w-0 flex-col gap-1">
                <span className="flex gap-1 text-base">
                  <span>상태:</span>
                  <span className="font-semibold">{running ? '실행 중' : '중단됨'}</span>
                </span>
                <span className="text-sm text-muted">
                  {running ? '스케줄러가 실행 중입니다.' : '스케줄러가 중단되었습니다.'}
                </span>
              </span>
            </Switch.Content>
          </Switch>
        </div>
      </Card.Content>
    </Card>
  );
}

export default function SchedulerList() {
  const [schedulers, setSchedulers] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);
  const fetchSchedulers = async () => {
    try {
      const res = await SchedulerClient.getSchedulerStatusList();
      setSchedulers(res);
    } catch (e) {
      console.error(e);
      ToastUtil.error('스케쥴러 조회 실패', '스케쥴러를 조회할 수 없습니다. 관리자에게 문의해주세요. ' + e);
    } finally {
      setIsPageLoading(false);
    }
  };

  const updateStatus = async (schedulerType, newValue) => {
    setIsUpdateLoading(true);
    let msg;
    try {
      if (newValue === true) {
        await SchedulerClient.startScheduler(schedulerType);
        msg = `스케쥴러를 성공적으로 시작하였습니다. scheduler: ${schedulerType}`;
      } else {
        await SchedulerClient.stopScheduler(schedulerType);
        msg = `스케쥴러를 성공적으로 중단하였습니다. scheduler: ${schedulerType}`;
      }
      ToastUtil.success('스케쥴러 상태 변경', msg);
    } catch (e) {
      console.error(e);
      ToastUtil.error('스케쥴러 상태 변경 실패', '스케쥴러 상태를 변경에 실패했습니다. ' + e.message);
    } finally {
      await fetchSchedulers();
      setIsUpdateLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedulers();
  }, []);

  if (isPageLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {schedulers.map((scheduler) => (
        <SchedulerCard
          scheduler={scheduler}
          key={scheduler.schedulerType}
          updateStatus={updateStatus}
          isUpdateLoading={isUpdateLoading}
        />
      ))}
    </div>
  );
}
