import {
  Button,
  Chip,
  DateField,
  DateRangePicker,
  Form,
  Label,
  ListBox,
  Modal,
  Pagination,
  RangeCalendar,
  Select,
  Spinner,
  Table,
} from '@heroui/react';
import { fromDate, getLocalTimeZone } from '@internationalized/date';
import { I18nProvider } from '@react-aria/i18n';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertClient } from '../api/alert/index.js';
import { SiteClient } from '../api/site/index.js';
import { ToastUtil } from '../util/toastUtil.js';

const PAGE_SIZE = 10;
const ONE_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
const MAX_RANGE_MILLISECONDS = 7 * ONE_DAY_IN_MILLISECONDS;
const LOCAL_TIME_ZONE = getLocalTimeZone();

const SYSTEM_OPTIONS = [
  { id: 'ALL', label: '전체' },
  { id: 'QUEUE', label: '대기열' },
  { id: 'SCHEDULER', label: '스케줄러' },
  { id: 'DOCKER', label: 'Docker 컨테이너' },
  { id: 'REDIS', label: 'Redis' },
  { id: 'HOST', label: '호스트' },
  { id: 'TARGET', label: 'Prometheus 수집' },
];

const STATUS_OPTIONS = [
  { id: 'ALL', label: '전체' },
  { id: 'FIRING', label: '발생' },
  { id: 'RESOLVED', label: '해제' },
];

const ALERT_LOG_COLUMNS = [
  { id: 'startedAt', label: '시작 일시', isRowHeader: true },
  { id: 'endedAt', label: '해제 일시' },
  { id: 'status', label: '상태' },
  { id: 'system', label: '시스템' },
  { id: 'title', label: '제목' },
  { id: 'target', label: '대상' },
];

const SYSTEM_BY_ALERTNAME = {
  QUEUE_WAIT: '대기열',
  SCHEDULER_FAILED: '스케줄러',
  SCHEDULER_STOPPED: '스케줄러',
  ContainerDown: 'Docker 컨테이너',
  RedisClusterDown: 'Redis',
  HostHighCpuLoad: '호스트',
  HostHighMemoryUsage: '호스트',
  HostLowDiskSpace: '호스트',
  PrometheusTargetDown: 'Prometheus 수집',
};

const createInitialFilters = () => {
  const end = new Date();
  end.setSeconds(0, 0);
  end.setMinutes(end.getMinutes() + 1);
  return {
    systemCode: '',
    status: '',
    siteId: '',
    dateRange: {
      start: fromDate(new Date(end.getTime() - ONE_DAY_IN_MILLISECONDS), LOCAL_TIME_ZONE),
      end: fromDate(end, LOCAL_TIME_ZONE),
    },
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

const toLocalDateTimeParameter = (value) => {
  if (!value) return undefined;
  const pad = (part) => String(part).padStart(2, '0');
  return `${value.year}-${pad(value.month)}-${pad(value.day)}T${pad(value.hour)}:${pad(value.minute)}:${pad(value.second ?? 0)}`;
};

const readJson = (value) => {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

const formatTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
};

const systemLabel = (alertname) => SYSTEM_BY_ALERTNAME[alertname] ?? alertname ?? '-';

const targetLabel = (item) => {
  if (item.siteId || item.roomId) return [item.siteId, item.roomId].filter(Boolean).join(' / ');
  const labels = readJson(item.labels);
  return labels.name || labels.instance || labels.job || labels.scheduler_code || '인프라';
};

const renderAlertCell = (item, columnId) => {
  const annotations = readJson(item.annotations);
  switch (columnId) {
    case 'startedAt':
      return formatTime(item.startedAt);
    case 'endedAt':
      return formatTime(item.endedAt);
    case 'status':
      return (
        <Chip size="sm" variant="soft" color={item.status === 'RESOLVED' ? 'success' : 'danger'}>
          {item.status === 'RESOLVED' ? '해제' : '발생'}
        </Chip>
      );
    case 'system':
      return systemLabel(item.alertname);
    case 'title':
      return <span className="line-clamp-2 max-w-80">{annotations.summary || item.alertname}</span>;
    case 'target':
      return targetLabel(item);
    default:
      return null;
  }
};

const pageItemsOf = (total, page) => {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const nearby = [1, page - 1, page, page + 1, total]
    .filter((value) => value >= 1 && value <= total)
    .filter((value, index, values) => values.indexOf(value) === index)
    .sort((a, b) => a - b);
  return nearby.flatMap((value, index) =>
    index > 0 && value - nearby[index - 1] > 1 ? [`ellipsis-${nearby[index - 1]}`, value] : [value]
  );
};

function FilterSelect({ id, label, value, onChange, options }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span id={`${id}-label`} className="text-sm font-medium">
        {label}
      </span>
      <Select
        aria-labelledby={`${id}-label`}
        value={value || 'ALL'}
        onChange={onChange}
        className="w-full"
        variant="secondary"
      >
        <Select.Trigger className="h-10">
          <Select.Value>{({ state }) => state.selectedItems[0]?.textValue}</Select.Value>
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {options.map((option) => (
              <ListBox.Item key={option.id} id={option.id} textValue={option.label}>
                {option.label}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
    </div>
  );
}

export default function AlertLogPage() {
  const [filters, setFilters] = useState(createInitialFilters);
  const [appliedFilters, setAppliedFilters] = useState(() => ({ ...filters }));
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const rangeError = getRangeError(filters.dateRange);

  useEffect(() => {
    document.title = '알림 이력 | Greenlight Admin';
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    SiteClient.getSites({ page: 1, size: 100, signal: controller.signal })
      .then(({ data }) => setSites(Array.isArray(data?.content) ? data.content : []))
      .catch((error) => {
        if (error.code !== 'ERR_CANCELED') {
          ToastUtil.error('알림 이력', '사이트 목록을 불러오지 못했습니다.');
        }
      });
    return () => controller.abort();
  }, []);

  const load = useCallback(
    (signal) => {
      AlertClient.getAlertLogs({
        page,
        size: PAGE_SIZE,
        systemCode: appliedFilters.systemCode,
        status: appliedFilters.status,
        siteId: appliedFilters.siteId,
        from: toLocalDateTimeParameter(appliedFilters.dateRange?.start),
        to: toLocalDateTimeParameter(appliedFilters.dateRange?.end),
        signal,
      })
        .then(({ data }) => setResult(data))
        .catch((error) => {
          if (error.code !== 'ERR_CANCELED') {
            ToastUtil.error('알림 이력', error.response?.data?.detail ?? '알림 이력을 불러오지 못했습니다.');
          }
        })
        .finally(() => {
          if (!signal.aborted) setLoading(false);
        });
    },
    [appliedFilters, page]
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const rows = useMemo(() => result.content ?? [], [result.content]);
  const pageItems = useMemo(() => pageItemsOf(result.totalPages, page), [page, result.totalPages]);
  const siteOptions = useMemo(
    () => [
      { id: 'ALL', label: '전체' },
      ...sites.map((site) => ({
        id: site.siteId,
        label: site.siteName ? `${site.siteName} (${site.siteId})` : site.siteId,
      })),
    ],
    [sites]
  );
  const selectedAnnotations = readJson(selected?.annotations);
  const selectedLabels = readJson(selected?.labels);

  const submit = (event) => {
    event.preventDefault();
    if (rangeError) return;
    setLoading(true);
    setPage(1);
    setAppliedFilters({ ...filters });
  };
  const reset = () => {
    const nextFilters = createInitialFilters();
    setLoading(true);
    setFilters(nextFilters);
    setAppliedFilters({ ...nextFilters });
    setPage(1);
  };

  return (
    <div className="w-full bg-neutral-50">
      <div className="max-w-[1080px] p-4 sm:p-6">
        <header className="mb-5 mt-4 sm:mt-8">
          <h1 className="text-2xl font-bold sm:text-3xl">알림 이력</h1>
        </header>

        <Form onSubmit={submit} className="mb-5 flex w-full flex-col gap-4 rounded-xl bg-white p-4 shadow-sm">
          <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <FilterSelect
              id="alert-log-system"
              label="시스템"
              value={filters.systemCode}
              onChange={(value) => setFilters({ ...filters, systemCode: value === 'ALL' ? '' : value })}
              options={SYSTEM_OPTIONS}
            />
            <FilterSelect
              id="alert-log-status"
              label="상태"
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value === 'ALL' ? '' : value })}
              options={STATUS_OPTIONS}
            />
            <FilterSelect
              id="alert-log-site"
              label="사이트"
              value={filters.siteId}
              onChange={(value) => setFilters({ ...filters, siteId: value === 'ALL' ? '' : value })}
              options={siteOptions}
            />
          </div>
          <div className="grid w-full gap-x-3 gap-y-1 lg:grid-cols-[minmax(0,40rem)_auto] lg:items-end">
            <I18nProvider locale="ko-KR">
              <DateRangePicker
                className="w-full min-w-0 lg:col-start-1 lg:row-start-1"
                value={filters.dateRange}
                onChange={(dateRange) => setFilters({ ...filters, dateRange })}
                granularity="minute"
                hourCycle={24}
                hideTimeZone
                shouldForceLeadingZeros
                isInvalid={Boolean(rangeError)}
                aria-describedby="alert-log-period-help"
              >
                <Label>기간</Label>
                <DateField.Group fullWidth variant="secondary">
                  <DateField.InputContainer>
                    <DateField.Input slot="start">
                      {(segment) => <DateField.Segment segment={segment} />}
                    </DateField.Input>
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
                  <RangeCalendar aria-label="알림 이력 기간 선택">
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
              id="alert-log-period-help"
              className={`text-sm lg:col-start-1 lg:row-start-2 ${rangeError ? 'text-danger' : 'text-muted'}`}
              role={rangeError ? 'alert' : undefined}
            >
              {rangeError ?? '시작과 종료 시각을 선택해 주세요. 최대 7일까지 조회할 수 있습니다.'}
            </p>
            <div className="flex gap-2 lg:col-start-2 lg:row-start-1">
              <Button type="submit" className="flex-1" isDisabled={Boolean(rangeError)}>
                조회
              </Button>
              <Button type="button" variant="secondary" onPress={reset}>
                초기화
              </Button>
            </div>
          </div>
        </Form>

        <div className="overflow-x-auto rounded-xl">
          <Table>
            <Table.Content
              aria-label="알림 이력"
              onRowAction={(key) => setSelected(rows.find((item) => String(item.alertId) === String(key)) ?? null)}
            >
              <Table.Header columns={ALERT_LOG_COLUMNS}>
                {(column) => (
                  <Table.Column id={column.id} isRowHeader={column.isRowHeader}>
                    {column.label}
                  </Table.Column>
                )}
              </Table.Header>
              <Table.Body>
                {loading ? (
                  <Table.LoadMore isLoading>
                    <Table.LoadMoreContent>
                      <Spinner color="accent" size="md" />
                    </Table.LoadMoreContent>
                  </Table.LoadMore>
                ) : (
                  <Table.Collection items={rows}>
                    {(item) => (
                      <Table.Row
                        id={String(item.alertId)}
                        className="cursor-pointer"
                        columns={ALERT_LOG_COLUMNS}
                        dependencies={[item]}
                      >
                        {(column) => (
                          <Table.Cell
                            className={
                              column.id === 'startedAt' || column.id === 'endedAt' ? 'whitespace-nowrap' : undefined
                            }
                          >
                            {renderAlertCell(item, column.id)}
                          </Table.Cell>
                        )}
                      </Table.Row>
                    )}
                  </Table.Collection>
                )}
              </Table.Body>
            </Table.Content>
          </Table>
          {!loading && rows.length === 0 && (
            <p className="p-8 text-center text-sm text-muted">조건에 맞는 알림 이력이 없습니다.</p>
          )}
        </div>

        {result.totalPages > 1 && (
          <Pagination className="mt-5 justify-center" aria-label="알림 이력 페이지">
            <Pagination.Summary className="hidden sm:block">
              {`${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, result.totalElements)} / ${result.totalElements}개`}
            </Pagination.Summary>
            <Pagination.Content>
              <Pagination.Item>
                <Pagination.Previous
                  aria-label="이전 페이지"
                  isDisabled={loading || page === 1}
                  onPress={() => {
                    setLoading(true);
                    setPage((value) => Math.max(1, value - 1));
                  }}
                >
                  <Pagination.PreviousIcon /> <span className="hidden sm:inline">이전</span>
                </Pagination.Previous>
              </Pagination.Item>
              {pageItems.map((item) =>
                typeof item === 'string' ? (
                  <Pagination.Item key={item}>
                    <Pagination.Ellipsis />
                  </Pagination.Item>
                ) : (
                  <Pagination.Item key={item}>
                    <Pagination.Link
                      isActive={item === page}
                      isDisabled={loading || item === page}
                      onPress={() => {
                        setLoading(true);
                        setPage(item);
                      }}
                    >
                      {item}
                    </Pagination.Link>
                  </Pagination.Item>
                )
              )}
              <Pagination.Item>
                <Pagination.Next
                  aria-label="다음 페이지"
                  isDisabled={loading || page === result.totalPages}
                  onPress={() => {
                    setLoading(true);
                    setPage((value) => Math.min(result.totalPages, value + 1));
                  }}
                >
                  <span className="hidden sm:inline">다음</span> <Pagination.NextIcon />
                </Pagination.Next>
              </Pagination.Item>
            </Pagination.Content>
          </Pagination>
        )}

        <Modal isOpen={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
          <Modal.Backdrop>
            <Modal.Container size="lg">
              <Modal.Dialog className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Heading>알림 상세</Modal.Heading>
                </Modal.Header>
                <Modal.Body className="flex flex-col gap-4">
                  {selected && (
                    <dl className="grid gap-2 text-sm sm:grid-cols-[7rem_1fr]">
                      <dt className="text-muted">상태</dt>
                      <dd>{selected.status === 'RESOLVED' ? '해제' : '발생'}</dd>
                      <dt className="text-muted">시스템</dt>
                      <dd>{systemLabel(selected.alertname)}</dd>
                      <dt className="text-muted">제목</dt>
                      <dd>{selectedAnnotations.summary || selected.alertname}</dd>
                      <dt className="text-muted">내용</dt>
                      <dd className="whitespace-pre-wrap">{selectedAnnotations.description || '-'}</dd>
                      <dt className="text-muted">대상</dt>
                      <dd className="break-all">{targetLabel(selected)}</dd>
                      <dt className="text-muted">시작 일시</dt>
                      <dd>{formatTime(selected.startedAt)}</dd>
                      <dt className="text-muted">해제 일시</dt>
                      <dd>{formatTime(selected.endedAt)}</dd>
                      <dt className="text-muted">식별자</dt>
                      <dd className="break-all font-mono text-xs">{selected.fingerprint || '-'}</dd>
                      <dt className="text-muted">라벨</dt>
                      <dd className="break-all text-xs text-muted">
                        {Object.entries(selectedLabels)
                          .map(([key, value]) => `${key}=${value}`)
                          .join(', ') || '-'}
                      </dd>
                    </dl>
                  )}
                </Modal.Body>
                <Modal.Footer>
                  <Button slot="close" variant="secondary">
                    닫기
                  </Button>
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
      </div>
    </div>
  );
}
