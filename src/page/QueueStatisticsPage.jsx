import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { getLocalTimeZone, fromDate } from '@internationalized/date';
import { I18nProvider } from '@react-aria/i18n';
import {
  Alert,
  Button,
  Card,
  DateField,
  DateRangePicker,
  Label,
  ListBox,
  RangeCalendar,
  Select,
  Table,
} from '@heroui/react';
import { QueueStatisticsClient } from '../api/queue-statistics/index.js';
import QueueStatisticsSkeleton from '../component/QueueStatisticsSkeleton.jsx';
import { buildQueueWindows, summarizeQueueStatistics, summarizeRooms } from './queueStatisticsHelpers.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const LOCAL_TIME_ZONE = getLocalTimeZone();
const MAX_RANGE_MILLISECONDS = 7 * 24 * 60 * 60 * 1000;

const initialDateRange = () => {
  const end = new Date();
  end.setSeconds(0, 0);
  return {
    start: fromDate(new Date(end.getTime() - 24 * 60 * 60 * 1000), LOCAL_TIME_ZONE),
    end: fromDate(end, LOCAL_TIME_ZONE),
  };
};

const getRangeError = (range) => {
  if (!range?.start || !range?.end) return '시작 및 종료 시각을 모두 입력해 주세요.';
  const start = range.start.toDate(LOCAL_TIME_ZONE).getTime();
  const end = range.end.toDate(LOCAL_TIME_ZONE).getTime();
  if (start >= end) return '시작 시각은 종료 시각보다 앞서야 합니다.';
  if (end - start > MAX_RANGE_MILLISECONDS) return '조회 기간은 최대 7일까지 선택할 수 있습니다.';
  return null;
};

const numberFormat = new Intl.NumberFormat('ko-KR');
const roomNameCollator = new Intl.Collator('ko-KR', { numeric: true, sensitivity: 'base' });
const formatNumber = (value) => numberFormat.format(value ?? 0);
const formatTimestamp = (timestamp) =>
  new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));

const chartOptions = (stacked = false) => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  elements: {
    line: { borderWidth: 1 },
    point: { radius: 0, hoverRadius: 3 },
  },
  plugins: {
    legend: { position: 'top', align: 'end' },
    tooltip: { callbacks: { title: (items) => formatTimestamp(new Date(items[0].parsed.x).toISOString()) } },
  },
  scales: {
    x: {
      type: 'linear',
      stacked,
      ticks: {
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 8,
        callback: (value) => formatTimestamp(new Date(value).toISOString()),
      },
    },
    y: { stacked, beginAtZero: true, ticks: { precision: 0 } },
  },
});

function KpiCard({ label, value, unit }) {
  return (
    <Card className="min-w-0">
      <Card.Content className="p-4">
        <p className="text-sm text-muted">{label}</p>
        <p className="mt-1 text-2xl font-bold tabular-nums">
          {formatNumber(value)}
          {unit}
        </p>
      </Card.Content>
    </Card>
  );
}

function ChartCard({ title, children, className = '', chartClassName = 'h-80' }) {
  return (
    <Card className={`min-w-0 ${className}`}>
      <Card.Header className="px-4 pt-4 pb-0">
        <h2 className="text-lg font-semibold">{title}</h2>
      </Card.Header>
      <Card.Content className="min-w-0 p-4">
        <div className={`relative min-w-0 w-full overflow-hidden ${chartClassName}`}>{children}</div>
      </Card.Content>
    </Card>
  );
}

export default function QueueStatisticsPage() {
  const [dateRange, setDateRange] = useState(initialDateRange);
  const [selectedRoomIds, setSelectedRoomIds] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roomSortDescriptor, setRoomSortDescriptor] = useState({
    column: 'name',
    direction: 'ascending',
  });
  const hasInitialLoad = useRef(false);
  const activeRequest = useRef(null);
  const requestGeneration = useRef(0);
  const rangeError = useMemo(() => getRangeError(dateRange), [dateRange]);

  const loadStatistics = useCallback(async () => {
    if (rangeError) return;
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    const generation = ++requestGeneration.current;
    setIsLoading(true);
    setError(null);
    try {
      const response = await QueueStatisticsClient.getQueueStatistics({
        signal: controller.signal,
        from: dateRange.start.toDate(LOCAL_TIME_ZONE).toISOString(),
        to: dateRange.end.toDate(LOCAL_TIME_ZONE).toISOString(),
        roomIds: selectedRoomIds.length > 0 ? selectedRoomIds : undefined,
      });
      if (generation !== requestGeneration.current) return;
      const data = response.data ?? {};
      setStatistics(data);
      setAvailableRooms(Array.isArray(data.availableRooms) ? data.availableRooms : []);
    } catch (requestError) {
      if (generation === requestGeneration.current && requestError.code !== 'ERR_CANCELED') setError(requestError);
    } finally {
      if (generation === requestGeneration.current) setIsLoading(false);
    }
  }, [dateRange, rangeError, selectedRoomIds]);

  useEffect(() => {
    document.title = '대기열 통계 | Greenlight Admin';
    if (!hasInitialLoad.current) {
      hasInitialLoad.current = true;
      loadStatistics();
    }
  }, [loadStatistics]);

  useEffect(
    () => () => {
      requestGeneration.current += 1;
      activeRequest.current?.abort();
    },
    []
  );

  const resultSeries = useMemo(() => statistics?.series ?? [], [statistics]);
  const windows = useMemo(() => buildQueueWindows(resultSeries), [resultSeries]);
  const summary = useMemo(() => summarizeQueueStatistics(resultSeries), [resultSeries]);
  const roomSummary = useMemo(() => summarizeRooms(resultSeries), [resultSeries]);
  const sortedRoomSummary = useMemo(() => {
    const { column, direction } = roomSortDescriptor;
    return [...roomSummary].sort((first, second) => {
      const comparison = column === 'name'
        ? roomNameCollator.compare(first.name, second.name)
        : (first[column] ?? 0) - (second[column] ?? 0);

      if (comparison !== 0) return direction === 'descending' ? -comparison : comparison;
      return roomNameCollator.compare(first.name, second.name);
    });
  }, [roomSummary, roomSortDescriptor]);
  const hasSeriesData = windows.length > 0;

  const queueSizeData = useMemo(
    () => ({
      datasets: [
        {
          label: '대기 인원',
          data: windows.map((window) => ({ x: new Date(window.timestamp).getTime(), y: window.totalWaiting })),
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, .12)',
          fill: true,
          tension: 0.25,
        },
        {
          label: '활성 인원',
          data: windows.map((window) => ({ x: new Date(window.timestamp).getTime(), y: window.totalActive })),
          borderColor: '#16a34a',
          backgroundColor: 'rgba(22, 163, 74, .08)',
          fill: true,
          tension: 0.25,
        },
      ],
    }),
    [windows]
  );
  const waitTimeData = useMemo(
    () => ({
      datasets: [
        {
          label: '대기 예상시간 (초)',
          data: windows.flatMap((window) =>
            window.estimatedWaitTime === null
              ? []
              : [{ x: new Date(window.timestamp).getTime(), y: window.estimatedWaitTime }]
          ),
          borderColor: '#9333ea',
          backgroundColor: 'rgba(147, 51, 234, .12)',
          spanGaps: false,
          tension: 0.25,
        },
      ],
    }),
    [windows]
  );
  const throughputData = useMemo(
    () => ({
      datasets: [
        {
          label: '대기 유입',
          data: windows.map((window) => ({ x: new Date(window.timestamp).getTime(), y: window.waitingCount })),
          borderColor: '#2563eb',
          backgroundColor: '#2563eb',
        },
        {
          label: '입장',
          data: windows.map((window) => ({ x: new Date(window.timestamp).getTime(), y: window.enteredCount })),
          borderColor: '#16a34a',
          backgroundColor: '#16a34a',
        },
        {
          label: '이탈',
          data: windows.map((window) => ({ x: new Date(window.timestamp).getTime(), y: window.exitedCount })),
          borderColor: '#f59e0b',
          backgroundColor: '#f59e0b',
        },
        {
          label: '취소',
          data: windows.map((window) => ({ x: new Date(window.timestamp).getTime(), y: window.cancelledCount })),
          borderColor: '#dc2626',
          backgroundColor: '#dc2626',
        },
      ],
    }),
    [windows]
  );

  return (
    <main className="max-w-[1440px] p-4">
      <h1 className="mb-4 mt-8 text-3xl font-bold">대기열 통계</h1>
      <Card className="mb-4">
        <Card.Content className="grid gap-x-3 gap-y-1 p-4 lg:grid-cols-[minmax(0,26rem)_minmax(0,14rem)_auto] lg:items-end">
          <I18nProvider locale="ko-KR">
            <DateRangePicker
              className="min-w-0 lg:col-start-1 lg:row-start-1"
              value={dateRange}
              onChange={setDateRange}
              granularity="minute"
              hourCycle={24}
              hideTimeZone
              shouldForceLeadingZeros
              isInvalid={Boolean(rangeError)}
              aria-describedby="queue-statistics-period-help"
            >
              <Label>기간</Label>
              <DateField.Group fullWidth variant="secondary">
                <DateField.InputContainer>
                  <DateField.Input slot="start">{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
                  <DateRangePicker.RangeSeparator />
                  <DateField.Input slot="end">{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
                </DateField.InputContainer>
                <DateField.Suffix>
                  <DateRangePicker.Trigger>
                    <DateRangePicker.TriggerIndicator />
                  </DateRangePicker.Trigger>
                </DateField.Suffix>
              </DateField.Group>
              <DateRangePicker.Popover>
                <RangeCalendar aria-label="통계 기간 선택">
                  <RangeCalendar.Header>
                    <RangeCalendar.YearPickerTrigger>
                      <RangeCalendar.YearPickerTriggerHeading />
                      <RangeCalendar.YearPickerTriggerIndicator />
                    </RangeCalendar.YearPickerTrigger>
                    <RangeCalendar.NavButton slot="previous" />
                    <RangeCalendar.NavButton slot="next" />
                  </RangeCalendar.Header>
                  <RangeCalendar.Grid>
                    <RangeCalendar.GridHeader>
                      {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
                    </RangeCalendar.GridHeader>
                    <RangeCalendar.GridBody>{(date) => <RangeCalendar.Cell date={date} />}</RangeCalendar.GridBody>
                  </RangeCalendar.Grid>
                </RangeCalendar>
              </DateRangePicker.Popover>
            </DateRangePicker>
          </I18nProvider>
          <p
            id="queue-statistics-period-help"
            className={`text-sm lg:col-start-1 lg:row-start-2 ${rangeError ? 'text-danger' : 'text-muted'}`}
            role={rangeError ? 'alert' : undefined}
          >
            {rangeError ?? '시작과 종료 시각을 선택해 주세요. 최대 7일까지 조회할 수 있습니다.'}
          </p>
          <div className="min-w-0 lg:col-start-2 lg:row-start-1">
            <span id="queue-statistics-room-label" className="mb-1 block text-sm font-medium">
              Room
            </span>
            <Select
              selectionMode="multiple"
              selectedKeys={new Set(selectedRoomIds)}
              onSelectionChange={(keys) => setSelectedRoomIds([...keys])}
              aria-labelledby="queue-statistics-room-label"
              variant="secondary"
            >
              <Select.Trigger>
                <Select.Value>
                  {({ state }) =>
                    state.selectedItems.length === 0 ? '전체' : `${state.selectedItems.length}개 Room 선택`
                  }
                </Select.Value>
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox selectionMode="multiple">
                  {availableRooms.map((room) => (
                    <ListBox.Item key={room.roomId} id={room.roomId} textValue={room.name}>
                      {room.name}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>
          <Button
            className="lg:col-start-3 lg:row-start-1"
            onPress={loadStatistics}
            isPending={isLoading}
            isDisabled={Boolean(rangeError)}
          >
            조회
          </Button>
        </Card.Content>
      </Card>

      {isLoading ? <QueueStatisticsSkeleton includeFilter={false} /> : null}
      {!isLoading && error ? (
        <div className="flex min-h-96 flex-col items-center justify-center gap-4 text-center">
          <p>통계를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>
          <Button onPress={loadStatistics} isDisabled={Boolean(rangeError)}>
            다시 시도
          </Button>
        </div>
      ) : null}
      {!isLoading && !error && availableRooms.length === 0 ? (
        <Alert status="neutral">
          <Alert.Content>
            <Alert.Title>통계를 조회할 LIVE 대기열이 없습니다</Alert.Title>
          </Alert.Content>
        </Alert>
      ) : null}
      {!isLoading && !error && availableRooms.length > 0 && !hasSeriesData ? (
        <Alert status="neutral">
          <Alert.Content>
            <Alert.Title>선택한 기간에 통계 데이터가 없습니다</Alert.Title>
          </Alert.Content>
        </Alert>
      ) : null}

      {!isLoading && !error && availableRooms.length > 0 && hasSeriesData ? (
        <>
          <section className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="대기열 핵심 지표">
            <KpiCard label="최대 동시 대기 인원" value={summary.maxWaiting} unit="명" />
            <KpiCard label="대기 유입" value={summary.waitingCount} unit="건" />
            <KpiCard label="입장" value={summary.enteredCount} unit="건" />
            <KpiCard label="취소" value={summary.cancelledCount} unit="건" />
          </section>
          <section className="grid gap-4">
            <ChartCard title="대기열 규모 추이" chartClassName="h-64">
              <Line data={queueSizeData} options={chartOptions()} />
            </ChartCard>
            <div className="grid gap-4 xl:grid-cols-2">
              <ChartCard title="대기 예상시간 추이" chartClassName="h-64">
                <Line data={waitTimeData} options={chartOptions()} />
              </ChartCard>
              <ChartCard title="처리량 추이" chartClassName="h-64">
                <Line data={throughputData} options={chartOptions(false)} />
              </ChartCard>
            </div>
          </section>
          <Card className="mt-4 overflow-hidden">
            <Card.Header className="px-4 pt-4 pb-0">
              <h2 className="text-lg font-semibold">Room별 요약</h2>
            </Card.Header>
            <Card.Content className="overflow-x-auto p-4">
              <Table>
                <Table.Content
                  aria-label="Room별 대기열 통계 요약"
                  sortDescriptor={roomSortDescriptor}
                  onSortChange={setRoomSortDescriptor}
                >
                  <Table.Header>
                    <Table.Column id="name" allowsSorting isRowHeader>
                      {({ sortDirection }) => (
                        <Table.SortableColumnHeader sortDirection={sortDirection}>Room</Table.SortableColumnHeader>
                      )}
                    </Table.Column>
                    <Table.Column id="maxWaiting" allowsSorting>
                      {({ sortDirection }) => (
                        <Table.SortableColumnHeader sortDirection={sortDirection}>
                          최대 동시 대기
                        </Table.SortableColumnHeader>
                      )}
                    </Table.Column>
                    <Table.Column id="maxActive" allowsSorting>
                      {({ sortDirection }) => (
                        <Table.SortableColumnHeader sortDirection={sortDirection}>최대 활성</Table.SortableColumnHeader>
                      )}
                    </Table.Column>
                    <Table.Column id="waitingCount" allowsSorting>
                      {({ sortDirection }) => (
                        <Table.SortableColumnHeader sortDirection={sortDirection}>대기 유입</Table.SortableColumnHeader>
                      )}
                    </Table.Column>
                    <Table.Column id="enteredCount" allowsSorting>
                      {({ sortDirection }) => (
                        <Table.SortableColumnHeader sortDirection={sortDirection}>입장</Table.SortableColumnHeader>
                      )}
                    </Table.Column>
                    <Table.Column id="exitedCount" allowsSorting>
                      {({ sortDirection }) => (
                        <Table.SortableColumnHeader sortDirection={sortDirection}>이탈</Table.SortableColumnHeader>
                      )}
                    </Table.Column>
                    <Table.Column id="cancelledCount" allowsSorting>
                      {({ sortDirection }) => (
                        <Table.SortableColumnHeader sortDirection={sortDirection}>취소</Table.SortableColumnHeader>
                      )}
                    </Table.Column>
                  </Table.Header>
                  <Table.Body>
                    <Table.Collection items={sortedRoomSummary}>
                      {(room) => (
                        <Table.Row id={room.roomId}>
                          <Table.Cell className="font-medium">{room.name}</Table.Cell>
                          <Table.Cell>{formatNumber(room.maxWaiting)}</Table.Cell>
                          <Table.Cell>{formatNumber(room.maxActive)}</Table.Cell>
                          <Table.Cell>{formatNumber(room.waitingCount)}</Table.Cell>
                          <Table.Cell>{formatNumber(room.enteredCount)}</Table.Cell>
                          <Table.Cell>{formatNumber(room.exitedCount)}</Table.Cell>
                          <Table.Cell>{formatNumber(room.cancelledCount)}</Table.Cell>
                        </Table.Row>
                      )}
                    </Table.Collection>
                  </Table.Body>
                </Table.Content>
              </Table>
            </Card.Content>
          </Card>
        </>
      ) : null}
    </main>
  );
}
