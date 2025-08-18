import { Card, CardBody, CardHeader, cn, Image, Skeleton, Switch } from '@heroui/react';
import { useEffect, useState } from 'react';
import { SchedulerClient } from '../../api/scheduler/index.js';
import { ToastUtil } from '../../util/toastUtil.js';

const schedulerDescription = {
  relocation: { title: 'relocation', name: '입장 스케쥴러', description: '실시간 고객 입장처리' },
  capacity: { title: 'capacity', name: '활성사용자 스케쥴러', description: '실시간 활성사용자 수 계산' },
  cleanup_session: { title: 'cleanup session', name: '세션 스케쥴러', description: '실시간 세션 계산 및 정리' },
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
      <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
        <p className="text-xs uppercase font-bold">{schedulerDescription[scheduler.schedulerType].title}</p>
        <small className="text-neutral-500">{schedulerDescription[scheduler.schedulerType].description}</small>
        <h4 className="font-semibold text-lg">{schedulerDescription[scheduler.schedulerType].name}</h4>
      </CardHeader>
      <CardBody className="overflow-visible p-4">
        <div className="min-w-44">
          <Switch
            isDisabled={isUpdateLoading}
            isSelected={running}
            onValueChange={(newValue) => {
              updateStatus(scheduler.schedulerType, newValue);
            }}
            classNames={{
              base: cn(
                'inline-flex flex-row-reverse w-full max-w-md bg-content1 hover:bg-content2 items-center',
                'justify-between cursor-pointer rounded-lg gap-2 p-4 border-2 border-default',
                'data-[selected=true]:border-primary'
              ),
              wrapper: 'p-0 h-4 overflow-visible',
              thumb: cn(
                'w-6 h-6 border-2 shadow-lg',
                'group-data-[hover=true]:border-primary',
                //selected
                'group-data-[selected=true]:ms-6',
                // pressed
                'group-data-[pressed=true]:w-7',
                'group-data-pressed:group-data-selected:ms-4'
              ),
            }}
          >
            <div className="flex flex-col gap-1 min-w-44">
              <div className="text-base flex gap-1">
                <span>상태:</span>
                <span className="font-semibold">{isRunning(scheduler.status) ? '실행 중' : '중단됨'}</span>
              </div>
              <p className="text-sm text-default-400">
                {isRunning(scheduler.status) ? '스케쥴러가 실행중입니다.' : '스케쥴러가 중단되었습니다'}
              </p>
            </div>
          </Switch>
        </div>
      </CardBody>
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
      console.log(e);
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
      console.log(e);
      ToastUtil.error('스케쥴러 상태 변경 실패', '스케쥴러 상태를 변경에 실패했습니다. ' + e.message);
    } finally {
      await fetchSchedulers();
      setIsUpdateLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedulers();
  }, []);
  return (
    <div>
      <Skeleton isLoaded={!isPageLoading} className="rounded-lg">
        <div className="flex gap-4">
          {schedulers.map((scheduler, index) => (
            <SchedulerCard
              scheduler={scheduler}
              key={index}
              updateStatus={updateStatus}
              isUpdateLoading={isUpdateLoading}
            />
          ))}
        </div>
      </Skeleton>
    </div>
  );
}
