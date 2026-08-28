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
  Chip,
  CloseButton,
  ComboBox,
  DateField,
  DateRangePicker,
  Dropdown,
  Form,
  Input,
  Label,
  ListBox,
  Modal,
  Radio,
  RadioGroup,
  RangeCalendar,
  Table,
} from '@heroui/react';
import { EllipsisVertical } from '@gravity-ui/icons';
import { QueueStatisticsClient } from '../api/queue-statistics/index.js';
import QueueStatisticsSkeleton from '../component/QueueStatisticsSkeleton.jsx';
import {
  buildQueueWindows,
  KPI_METRICS,
  ROOM_SUMMARY_METRICS,
  TOTAL_ROOM_ID,
  summarizeQueueStatistics,
  summarizeRoomTotals,
  summarizeRooms,
  withConcurrentPeaks,
} from './queueStatisticsHelpers.js';
import { downloadQueueStatisticsXlsx } from './queueStatisticsExport.js';
import { ToastUtil } from '../util/toastUtil.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const LOCAL_TIME_ZONE = getLocalTimeZone();
const DAY_MILLISECONDS = 24 * 60 * 60 * 1000;
const EXPORT_WINDOWS = [
  { value: '1m', label: '1분', maxDays: 1 },
  { value: '10m', label: '10분', maxDays: 7 },
  { value: '1h', label: '60분', maxDays: 15 },
];

const initialDateRange = () => {
  const end = new Date();
  end.setSeconds(0, 0);
  return {
    start: fromDate(new Date(end.getTime() - 24 * 60 * 60 * 1000), LOCAL_TIME_ZONE),
    end: fromDate(end, LOCAL_TIME_ZONE),
  };
};

const getRangeError = (range, maxDays = 7, { includeWindowHint = false } = {}) => {
  if (!range?.start || !range?.end) return '시작 및 종료 시각을 모두 입력해 주세요.';
  const start = range.start.toDate(LOCAL_TIME_ZONE).getTime();
  const end = range.end.toDate(LOCAL_TIME_ZONE).getTime();
  if (start >= end) return '시작 시각은 종료 시각보다 앞서야 합니다.';
  if (end - start > maxDays * DAY_MILLISECONDS) {
    return includeWindowHint
      ? `조회 기간은 최대 ${maxDays}일까지 선택할 수 있습니다. 범위나 시간 단위를 조정해 주세요.`
      : `조회 기간은 최대 ${maxDays}일까지 선택할 수 있습니다.`;
  }
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

const normalizeComboBoxKeys = (keys) => {
  if (keys == null) return [];
  if (Array.isArray(keys)) return keys.map(String);
  if (typeof keys === 'string' || typeof keys === 'number') return [String(keys)];
  return [...keys].map(String);
};

const formatRoomName = (room) => `${room?.name || room?.roomId || ''}${room?.enabled === false ? ' (비활성)' : ''}`;

const roomSearchText = (room) => [formatRoomName(room), room?.description].filter(Boolean).join(' ');

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

function RoomComboBox({ rooms, selectedIds, onChange }) {
  return (
    <ComboBox
      className="w-full min-w-0 max-w-full"
      fullWidth
      selectionMode="multiple"
      value={selectedIds}
      onChange={(keys) => onChange(normalizeComboBoxKeys(keys))}
      variant="secondary"
    >
      <Label>대기열</Label>
      <ComboBox.InputGroup className="min-w-0">
        <Input className="min-w-0 truncate" placeholder="대기열 선택" />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover className="max-w-[min(24rem,calc(100vw-2rem))]">
        <ListBox selectionMode="multiple">
          {rooms.map((room) => (
            <ListBox.Item key={room.roomId} id={room.roomId} textValue={roomSearchText(room)}>
              <div className="flex min-w-0 flex-col overflow-hidden">
                <span className="truncate">{formatRoomName(room)}</span>
                {room.description ? <span className="truncate text-xs text-muted">{room.description}</span> : null}
              </div>
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  );
}

function SelectedRoomChips({ rooms, selectedIds, onRemove, className = '' }) {
  if (selectedIds.length === 0) return null;
  return (
    <div className={`flex min-w-0 flex-wrap gap-2 ${className}`.trim()}>
      {selectedIds.map((roomId) => {
        const room = rooms.find((item) => item.roomId === roomId) ?? { roomId, name: roomId };
        return (
          <Chip key={roomId} size="md" variant="soft" className="inline-flex max-w-full min-w-0 items-center gap-0.5">
            <span className="truncate">{formatRoomName(room)}</span>
            <CloseButton
              aria-label={`${formatRoomName(room)} 선택 해제`}
              className="size-4 min-h-0 min-w-0 p-0 [&_svg]:size-3"
              onPress={() => onRemove(roomId)}
            />
          </Chip>
        );
      })}
    </div>
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
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportRange, setExportRange] = useState(initialDateRange);
  const [exportWindow, setExportWindow] = useState('10m');
  const [exportRoomIds, setExportRoomIds] = useState([]);
  const [isExportingXlsx, setIsExportingXlsx] = useState(false);
  const [roomSortDescriptor, setRoomSortDescriptor] = useState({
    column: 'name',
    direction: 'ascending',
  });
  const hasInitialLoad = useRef(false);
  const activeRequest = useRef(null);
  const requestGeneration = useRef(0);
  const rangeError = useMemo(() => getRangeError(dateRange, 7), [dateRange]);
  const exportWindowOption = EXPORT_WINDOWS.find((option) => option.value === exportWindow) ?? EXPORT_WINDOWS[1];
  const exportRangeError = useMemo(
    () => getRangeError(exportRange, exportWindowOption.maxDays, { includeWindowHint: true }),
    [exportRange, exportWindowOption.maxDays]
  );

  const loadStatistics = useCallback(async () => {
    if (rangeError) return;
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    const generation = ++requestGeneration.current;
    const currentRange = {
      from: dateRange.start.toDate(LOCAL_TIME_ZONE).toISOString(),
      to: dateRange.end.toDate(LOCAL_TIME_ZONE).toISOString(),
    };
    setIsLoading(true);
    setError(null);
    try {
      const response = await QueueStatisticsClient.getQueueStatistics({
        signal: controller.signal,
        ...currentRange,
        roomIds: selectedRoomIds.length > 0 ? selectedRoomIds : undefined,
      });
      if (generation !== requestGeneration.current) return;
      const data = response.data ?? {};
      setStatistics(data);
      setAvailableRooms(Array.isArray(data.availableRooms) ? data.availableRooms : []);
    } catch (requestError) {
      if (generation === requestGeneration.current && requestError.code !== 'ERR_CANCELED') {
        setError(requestError);
      }
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
  const summary = useMemo(
    () => withConcurrentPeaks(summarizeQueueStatistics(resultSeries), statistics),
    [resultSeries, statistics]
  );
  const roomSummary = useMemo(() => summarizeRooms(resultSeries), [resultSeries]);
  const sortedRoomSummary = useMemo(() => {
    const { column, direction } = roomSortDescriptor;
    return [...roomSummary].sort((first, second) => {
      const sortResult =
        column === 'name'
          ? roomNameCollator.compare(first.name, second.name)
          : (first[column] ?? 0) - (second[column] ?? 0);

      if (sortResult !== 0) return direction === 'descending' ? -sortResult : sortResult;
      return roomNameCollator.compare(first.name, second.name);
    });
  }, [roomSummary, roomSortDescriptor]);
  const enabledRoomIds = useMemo(
    () => availableRooms.filter((room) => room.enabled !== false).map((room) => room.roomId),
    [availableRooms]
  );
  const roomSummaryTotal = useMemo(
    () => summarizeRoomTotals(sortedRoomSummary, summary),
    [sortedRoomSummary, summary]
  );
  const summaryTableItems = useMemo(
    () => (sortedRoomSummary.length > 0 ? [...sortedRoomSummary, roomSummaryTotal] : []),
    [roomSummaryTotal, sortedRoomSummary]
  );
  const hasSeriesData = windows.length > 0;
  const canOpenExport = Boolean(!isLoading && availableRooms.length > 0);

  const openExportDialog = () => {
    const selectedEnabledIds = selectedRoomIds.filter((roomId) => enabledRoomIds.includes(roomId));
    setExportRange(dateRange);
    setExportWindow('10m');
    setExportRoomIds(
      selectedRoomIds.length === 0 || selectedEnabledIds.length === 0 ? enabledRoomIds : selectedEnabledIds
    );
    setIsExportOpen(true);
  };

  const handleXlsxExport = async (event) => {
    event.preventDefault();
    if (exportRangeError) return;
    setIsExportingXlsx(true);
    try {
      const currentRange = {
        from: exportRange.start.toDate(LOCAL_TIME_ZONE).toISOString(),
        to: exportRange.end.toDate(LOCAL_TIME_ZONE).toISOString(),
      };
      const roomIds = exportRoomIds.length > 0 ? exportRoomIds : enabledRoomIds;
      if (roomIds.length === 0) return;
      const response = await QueueStatisticsClient.getQueueStatistics({
        ...currentRange,
        roomIds,
        window: exportWindow,
      });
      const series = response.data?.series ?? [];
      await downloadQueueStatisticsXlsx({
        currentRange,
        windowLabel: exportWindowOption.label,
        summary: withConcurrentPeaks(summarizeQueueStatistics(series), response.data),
        rooms: summarizeRooms(series),
        series,
      });
      setIsExportOpen(false);
    } catch (exportError) {
      console.error(exportError);
      ToastUtil.error('Excel 내보내기', exportError.response?.data?.detail ?? '파일을 생성하지 못했습니다.');
    } finally {
      setIsExportingXlsx(false);
    }
  };

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
          label: '체류 인원',
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
          label: '전체 유입',
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
    <main className="w-full min-w-0 max-w-[1080px] p-4 sm:p-6">
      <div className="mb-4 mt-4 flex items-center justify-between gap-2 sm:mt-8">
        <h1 className="text-2xl font-bold sm:text-3xl">대기열 통계</h1>
        <Dropdown>
          <Button isIconOnly slot="trigger" variant="tertiary" aria-label="더보기">
            <EllipsisVertical className="h-5 w-5" />
          </Button>
          <Dropdown.Popover placement="bottom end">
            <Dropdown.Menu
              aria-label="대기열 통계 작업"
              disabledKeys={canOpenExport && !isExportingXlsx ? [] : ['export-xlsx']}
              onAction={(key) => {
                if (key === 'export-xlsx') openExportDialog();
              }}
            >
              <Dropdown.Item id="export-xlsx" textValue="Excel 내보내기">
                Excel 내보내기
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      </div>
      <Card className="mb-4">
        <Card.Content className="grid gap-x-3 gap-y-1 p-4 lg:grid-cols-[minmax(0,26rem)_minmax(0,18rem)_auto] lg:items-end">
          <I18nProvider locale="ko-KR">
            <DateRangePicker
              className="w-full min-w-0 lg:col-start-1 lg:row-start-1"
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
            <RoomComboBox rooms={availableRooms} selectedIds={selectedRoomIds} onChange={setSelectedRoomIds} />
          </div>
          <Button
            className="w-full sm:w-auto sm:justify-self-start lg:col-start-3 lg:row-start-1"
            onPress={loadStatistics}
            isPending={isLoading}
            isDisabled={Boolean(rangeError)}
          >
            조회
          </Button>
          <div className="min-w-0 lg:col-span-3 lg:col-start-1 lg:row-start-3">
            <SelectedRoomChips
              className="pt-2"
              rooms={availableRooms}
              selectedIds={selectedRoomIds}
              onRemove={(roomId) =>
                setSelectedRoomIds((current) => current.filter((currentId) => currentId !== roomId))
              }
            />
          </div>
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
          <section className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" aria-label="대기열 핵심 지표">
            {KPI_METRICS.map(({ key, label, unit }) => (
              <KpiCard key={key} label={label} value={summary[key]} unit={unit} />
            ))}
          </section>
          <section className="grid gap-4">
            <ChartCard title="대기/체류 인원" chartClassName="h-64">
              <Line data={queueSizeData} options={chartOptions()} />
            </ChartCard>
            <div className="grid gap-4 xl:grid-cols-2">
              <ChartCard title="대기 예상시간" chartClassName="h-64">
                <Line data={waitTimeData} options={chartOptions()} />
              </ChartCard>
              <ChartCard title="처리량" chartClassName="h-64">
                <Line data={throughputData} options={chartOptions(false)} />
              </ChartCard>
            </div>
          </section>
          <Card className="mt-4 overflow-hidden">
            <Card.Header className="px-4 pt-4 pb-0">
              <h2 className="text-lg font-semibold">대기열 요약</h2>
            </Card.Header>
            <Card.Content className="overflow-x-auto p-4">
              <div className="min-w-[760px]">
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
                            최대 대기
                          </Table.SortableColumnHeader>
                        )}
                      </Table.Column>
                      <Table.Column id="maxActive" allowsSorting>
                        {({ sortDirection }) => (
                          <Table.SortableColumnHeader sortDirection={sortDirection}>
                            최대 체류
                          </Table.SortableColumnHeader>
                        )}
                      </Table.Column>
                      <Table.Column id="waitingCount" allowsSorting>
                        {({ sortDirection }) => (
                          <Table.SortableColumnHeader sortDirection={sortDirection}>
                            전체 유입
                          </Table.SortableColumnHeader>
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
                      <Table.Collection items={summaryTableItems}>
                        {(room) => {
                          const isTotal = room.roomId === TOTAL_ROOM_ID;
                          const totalCellClass =
                            '!bg-accent/10 font-semibold hover:!bg-accent/10 border-t-1 !border-t-accent/40';
                          return (
                            <Table.Row id={room.roomId}>
                              <Table.Cell className={isTotal ? totalCellClass : 'font-medium'}>
                                {isTotal ? '합계' : formatRoomName(room)}
                              </Table.Cell>
                              {ROOM_SUMMARY_METRICS.map(({ key }) => (
                                <Table.Cell
                                  key={key}
                                  className={isTotal ? `${totalCellClass} tabular-nums` : 'tabular-nums'}
                                >
                                  {formatNumber(room[key])}
                                </Table.Cell>
                              ))}
                            </Table.Row>
                          );
                        }}
                      </Table.Collection>
                    </Table.Body>
                  </Table.Content>
                </Table>
              </div>
            </Card.Content>
          </Card>
        </>
      ) : null}

      <Modal
        isOpen={isExportOpen}
        onOpenChange={(open) => {
          if (!open && !isExportingXlsx) setIsExportOpen(false);
        }}
      >
        <Modal.Backdrop isDismissable={!isExportingXlsx}>
          <Modal.Container size="lg">
            <Modal.Dialog className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-lg">
              <Modal.CloseTrigger isDisabled={isExportingXlsx} />
              <Modal.Header>
                <Modal.Heading>Excel 내보내기</Modal.Heading>
              </Modal.Header>
              <Form onSubmit={handleXlsxExport}>
                <Modal.Body className="flex flex-col gap-4">
                  <I18nProvider locale="ko-KR">
                    <DateRangePicker
                      className="w-full min-w-0"
                      value={exportRange}
                      onChange={setExportRange}
                      granularity="minute"
                      hourCycle={24}
                      hideTimeZone
                      shouldForceLeadingZeros
                      isInvalid={Boolean(exportRangeError)}
                    >
                      <Label>조회 범위</Label>
                      <DateField.Group fullWidth variant="secondary">
                        <DateField.InputContainer>
                          <DateField.Input slot="start">
                            {(segment) => <DateField.Segment segment={segment} />}
                          </DateField.Input>
                          <DateRangePicker.RangeSeparator />
                          <DateField.Input slot="end">
                            {(segment) => <DateField.Segment segment={segment} />}
                          </DateField.Input>
                        </DateField.InputContainer>
                        <DateField.Suffix>
                          <DateRangePicker.Trigger>
                            <DateRangePicker.TriggerIndicator />
                          </DateRangePicker.Trigger>
                        </DateField.Suffix>
                      </DateField.Group>
                      <DateRangePicker.Popover>
                        <RangeCalendar aria-label="내보내기 기간 선택">
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
                            <RangeCalendar.GridBody>
                              {(date) => <RangeCalendar.Cell date={date} />}
                            </RangeCalendar.GridBody>
                          </RangeCalendar.Grid>
                        </RangeCalendar>
                      </DateRangePicker.Popover>
                    </DateRangePicker>
                  </I18nProvider>
                  {exportRangeError ? <p className="text-sm text-danger">{exportRangeError}</p> : null}
                  <RadioGroup value={exportWindow} onChange={setExportWindow} variant="secondary">
                    <Label>시간 단위</Label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      {EXPORT_WINDOWS.map((option) => (
                        <Radio
                          key={option.value}
                          value={option.value}
                          className="relative flex-1 items-stretch rounded-xl bg-surface px-4 py-3 ring ring-neutral-300 data-[selected=true]:ring-2 data-[selected=true]:ring-accent"
                        >
                          <Radio.Content className="static flex w-full items-center gap-3 after:absolute after:inset-0 after:content-['']">
                            <Radio.Control>
                              <Radio.Indicator />
                            </Radio.Control>
                            <span>{option.label}</span>
                          </Radio.Content>
                        </Radio>
                      ))}
                    </div>
                  </RadioGroup>
                  <div className="min-w-0">
                    <RoomComboBox rooms={availableRooms} selectedIds={exportRoomIds} onChange={setExportRoomIds} />
                    <SelectedRoomChips
                      className="mt-2"
                      rooms={availableRooms}
                      selectedIds={exportRoomIds}
                      onRemove={(roomId) =>
                        setExportRoomIds((current) => current.filter((currentId) => currentId !== roomId))
                      }
                    />
                  </div>
                </Modal.Body>
                <Modal.Footer className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button slot="close" variant="tertiary" isDisabled={isExportingXlsx}>
                    취소
                  </Button>
                  <Button
                    type="submit"
                    isPending={isExportingXlsx}
                    isDisabled={
                      Boolean(exportRangeError) || (exportRoomIds.length === 0 && enabledRoomIds.length === 0)
                    }
                  >
                    내보내기
                  </Button>
                </Modal.Footer>
              </Form>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </main>
  );
}
