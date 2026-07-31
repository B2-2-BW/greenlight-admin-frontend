import { Alert, Card, Chip, Skeleton } from '@heroui/react';
import { useEffect, useState } from 'react';
import { SchedulerClient } from '../../api/scheduler/index.js';

const POLLING_INTERVAL_MS = 5000;

function StatusChip({ status }) {
  const isUp = status === 'UP' || status === 'RUNNING';
  return (
    <Chip color={isUp ? 'success' : 'danger'} variant="soft" size="md">
      {isUp ? '정상' : '중단'}
    </Chip>
  );
}

function ComponentCard({ title, description, status }) {
  return (
    <Card className="py-4">
      <Card.Header className="flex items-start justify-between gap-4 px-4 pb-0 pt-2">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted">{description}</p>
        </div>
        <StatusChip status={status} />
      </Card.Header>
    </Card>
  );
}

function LoadingCards() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Skeleton className="h-32 rounded-lg" />
      <Skeleton className="h-32 rounded-lg" />
      <Skeleton className="h-32 rounded-lg" />
    </div>
  );
}

export default function SchedulerList() {
  const [systemStatus, setSystemStatus] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isUnavailable, setIsUnavailable] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchSystemStatus = async () => {
      try {
        const data = await SchedulerClient.getSchedulerStatusList();
        if (!cancelled) {
          setSystemStatus(data);
          setIsUnavailable(false);
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setSystemStatus(null);
          setIsUnavailable(true);
        }
      } finally {
        if (!cancelled) {
          setIsInitialLoading(false);
        }
      }
    };

    fetchSystemStatus();
    const intervalId = window.setInterval(fetchSystemStatus, POLLING_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  if (isInitialLoading) {
    return <LoadingCards />;
  }

  if (!systemStatus && isUnavailable) {
    return (
      <Alert status="danger">
        <Alert.Content>
          <Alert.Title>시스템 상태를 조회할 수 없습니다</Alert.Title>
          <Alert.Description>서버 연결 상태를 확인해 주세요.</Alert.Description>
        </Alert.Content>
      </Alert>
    );
  }

  const schedulers = systemStatus?.scheduler?.schedulers ?? [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ComponentCard
          title="DB"
          description="데이터베이스 연결 상태"
          status={systemStatus?.database?.status}
        />
        <ComponentCard
          title="Redis"
          description="Redis 연결 상태"
          status={systemStatus?.redis?.status}
        />
        <ComponentCard
          title="Scheduler"
          description="Scheduler 인스턴스 연결 상태"
          status={systemStatus?.scheduler?.status}
        />
      </div>

      <Card className="py-4">
        <Card.Header className="px-4 pb-0 pt-2">
          <h2 className="text-lg font-semibold">Scheduler 작업 상태</h2>
        </Card.Header>
        <Card.Content className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
          {schedulers.length === 0 ? (
            <p className="text-sm text-muted">확인할 수 있는 Scheduler 작업이 없습니다.</p>
          ) : (
            schedulers.map((scheduler) => (
              <div
                key={scheduler.schedulerCode}
                className="flex items-center justify-between gap-4 rounded-lg border border-default p-4"
              >
                <div className="min-w-0">
                  <p className="font-medium">{scheduler.name || scheduler.schedulerCode}</p>
                  {scheduler.description ? (
                    <p className="mt-1 text-sm text-muted">{scheduler.description}</p>
                  ) : null}
                </div>
                <StatusChip status={scheduler.status} />
              </div>
            ))
          )}
        </Card.Content>
      </Card>
    </div>
  );
}
