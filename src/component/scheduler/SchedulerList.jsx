import { Alert, Chip, Skeleton } from '@heroui/react';
import { useEffect, useState } from 'react';
import { SchedulerClient } from '../../api/scheduler/index.js';
import FormSection from '../common/FormSection.jsx';
import { formatDate } from '../../util/dateUtil.jsx';

const POLLING_INTERVAL_MS = 5000;

const CONNECTIONS = [
  { key: 'database', title: 'DB' },
  { key: 'redis', title: 'Redis' },
  { key: 'scheduler', title: 'Scheduler' },
];

function StatusChip({ status }) {
  const isUp = status === 'UP' || status === 'RUNNING';
  return (
    <Chip color={isUp ? 'success' : 'danger'} variant="soft" size="sm" className="shrink-0">
      {isUp ? '정상' : '중단'}
    </Chip>
  );
}

function ConnectionRows({ systemStatus }) {
  return (
    <div className="divide-y divide-neutral-200">
      {CONNECTIONS.map((connection) => (
        <div key={connection.key} className="flex items-center justify-between gap-4 py-3">
          <p className="font-medium">{connection.title}</p>
          <StatusChip status={systemStatus?.[connection.key]?.status} />
        </div>
      ))}
    </div>
  );
}

function checkedAtLabel(checkedAt) {
  if (!checkedAt) return null;
  return (
    <span className="whitespace-nowrap text-xs font-normal leading-5 text-muted">
      마지막 확인일자: {formatDate(checkedAt)}
    </span>
  );
}

function StatusRow({ children }) {
  return <div className="flex flex-col gap-4 sm:flex-row sm:items-start">{children}</div>;
}

function LoadingSections() {
  return (
    <StatusRow>
      <div className="min-w-0 w-full sm:flex-1">
        <FormSection title="연결 상태">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-8 rounded-lg" />
            <Skeleton className="h-8 rounded-lg" />
            <Skeleton className="h-8 rounded-lg" />
          </div>
        </FormSection>
      </div>
      <div className="min-w-0 w-full sm:flex-1">
        <FormSection title="Scheduler 작업 상태">
          <Skeleton className="h-16 rounded-lg" />
        </FormSection>
      </div>
    </StatusRow>
  );
}

export default function SchedulerList() {
  const [systemStatus, setSystemStatus] = useState(null);
  const [checkedAt, setCheckedAt] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isUnavailable, setIsUnavailable] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchSystemStatus = async () => {
      try {
        const data = await SchedulerClient.getSchedulerStatusList();
        if (!cancelled) {
          setSystemStatus(data);
          setCheckedAt(new Date().toISOString());
          setIsUnavailable(false);
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setSystemStatus(null);
          setCheckedAt(null);
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
    return <LoadingSections />;
  }

  if (!systemStatus && isUnavailable) {
    return (
      <Alert status="danger">
        <Alert.Content>
          <Alert.Title>시스템 관리 정보를 조회할 수 없습니다</Alert.Title>
          <Alert.Description>서버 연결 상태를 확인해 주세요.</Alert.Description>
        </Alert.Content>
      </Alert>
    );
  }

  const schedulers = systemStatus?.scheduler?.schedulers ?? [];

  const checkedLabel = checkedAtLabel(checkedAt);

  return (
    <StatusRow>
      <div className="min-w-0 w-full sm:flex-1">
        <FormSection title="연결 상태" endContent={checkedLabel}>
          <ConnectionRows systemStatus={systemStatus} />
        </FormSection>
      </div>

      <div className="min-w-0 w-full sm:flex-1">
        <FormSection title="Scheduler 작업 상태" endContent={checkedLabel}>
          {schedulers.length === 0 ? (
            <p className="text-sm text-muted">확인할 수 있는 Scheduler 작업이 없습니다.</p>
          ) : (
            <div className="divide-y divide-neutral-200">
              {schedulers.map((scheduler) => (
                <div key={scheduler.schedulerCode} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="font-medium">{scheduler.name || scheduler.schedulerCode}</p>
                    {scheduler.description ? <p className="mt-1 text-sm text-muted">{scheduler.description}</p> : null}
                  </div>
                  <StatusChip status={scheduler.status} />
                </div>
              ))}
            </div>
          )}
        </FormSection>
      </div>
    </StatusRow>
  );
}
