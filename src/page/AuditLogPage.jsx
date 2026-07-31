import {
  Button,
  Chip,
  DateField,
  DateRangePicker,
  Form,
  Input,
  Label,
  ListBox,
  Modal,
  Pagination,
  RangeCalendar,
  Select,
  Spinner,
  Table,
  TextField,
} from '@heroui/react';
import { fromDate, getLocalTimeZone } from '@internationalized/date';
import { I18nProvider } from '@react-aria/i18n';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuditClient } from '../api/audit/index.js';
import ChangeDiff from '../component/audit/ChangeDiff.jsx';
import { useUserStore } from '../store/user.jsx';
import { ToastUtil } from '../util/toastUtil.js';

const PAGE_SIZE = 20;
const ONE_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
const LOCAL_TIME_ZONE = getLocalTimeZone();

const createInitialFilters = () => {
  const end = new Date();
  end.setSeconds(0, 0);
  return {
    siteId: '',
    createdBy: '',
    targetType: '',
    action: '',
    dateRange: {
      start: fromDate(new Date(end.getTime() - ONE_DAY_IN_MILLISECONDS), LOCAL_TIME_ZONE),
      end: fromDate(end, LOCAL_TIME_ZONE),
    },
  };
};

const getRangeError = (range) => {
  if (!range?.start || !range?.end) return '시작 및 종료 시각을 모두 입력해 주세요.';
  if (range.start.compare(range.end) >= 0) return '시작 시각은 종료 시각보다 앞서야 합니다.';
  return null;
};

const toLocalDateTimeParameter = (value) => {
  if (!value) return undefined;
  const pad = (part) => String(part).padStart(2, '0');
  return `${value.year}-${pad(value.month)}-${pad(value.day)}T${pad(value.hour)}:${pad(value.minute)}:${pad(value.second ?? 0)}`;
};

const toRequestFilters = ({ dateRange, ...filters }) => ({
  ...filters,
  from: toLocalDateTimeParameter(dateRange?.start),
  to: toLocalDateTimeParameter(dateRange?.end),
});

const actionLabels = {
  UPDATE: '수정',
  CREATE: '생성',
  DELETE: '삭제',
};

const targetTypeLabels = {
  SITE: '사이트',
  ROOM: '대기열',
  USER: '사용자',
};

const targetTypeOptions = [
  { id: 'ALL', label: '전체' },
  ...Object.entries(targetTypeLabels).map(([id, label]) => ({ id, label })),
];

const actionOptions = [
  { id: 'ALL', label: '전체' },
  ...Object.entries(actionLabels).map(([id, label]) => ({ id, label })),
];

const parseChanges = (changeDetail) => {
  try {
    return JSON.parse(changeDetail);
  } catch {
    return {};
  }
};

function AuditTextFilter({ id, label, value, onChange }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span id={`${id}-label`} className="text-sm font-medium">
        {label}
      </span>
      <TextField aria-labelledby={`${id}-label`} className="w-full" variant="secondary">
        <Input variant="secondary" value={value} onChange={onChange} />
      </TextField>
    </div>
  );
}

function AuditFilterSelect({ id, label, value, onChange, options }) {
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

export default function AuditLogPage() {
  const role = useUserStore((state) => state.user?.userRole ?? state.user?.role);
  const [filters, setFilters] = useState(createInitialFilters);
  const [appliedFilters, setAppliedFilters] = useState(() => ({ ...filters }));
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const rangeError = getRangeError(filters.dateRange);

  const load = useCallback(
    (signal) => {
      AuditClient.getAuditLogs({ ...toRequestFilters(appliedFilters), page, size: PAGE_SIZE, signal })
        .then(({ data }) => setResult(data))
        .catch((error) => {
          if (error.code !== 'ERR_CANCELED') {
            ToastUtil.error('감사로그', error.response?.data?.detail ?? '감사로그를 불러오지 못했습니다.');
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
  const pageItems = useMemo(() => {
    const total = result.totalPages;
    if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
    const nearby = [1, page - 1, page, page + 1, total]
      .filter((value) => value >= 1 && value <= total)
      .filter((value, index, values) => values.indexOf(value) === index)
      .sort((a, b) => a - b);
    return nearby.flatMap((value, index) =>
      index > 0 && value - nearby[index - 1] > 1 ? [`ellipsis-${nearby[index - 1]}`, value] : [value]
    );
  }, [page, result.totalPages]);
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
          <h1 className="text-2xl font-bold sm:text-3xl">감사로그</h1>
          <p className="mt-2 text-sm text-muted">관리자가 변경한 설정과 사유를 확인합니다.</p>
        </header>

        <Form onSubmit={submit} className="mb-5 flex w-full flex-col gap-4 rounded-xl bg-white p-4 shadow-sm">
          <div className={`grid w-full gap-3 sm:grid-cols-2 ${role === 'SUPER' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
            {role === 'SUPER' && (
              <AuditTextFilter
                id="audit-site-id"
                label="사이트 ID"
                value={filters.siteId}
                onChange={(event) => setFilters({ ...filters, siteId: event.target.value })}
              />
            )}
            <AuditTextFilter
              id="audit-created-by"
              label="작업자"
              value={filters.createdBy}
              onChange={(event) => setFilters({ ...filters, createdBy: event.target.value })}
            />
            <AuditFilterSelect
              id="audit-target-type"
              label="대상 유형"
              value={filters.targetType}
              onChange={(value) => setFilters({ ...filters, targetType: value === 'ALL' ? '' : value })}
              options={targetTypeOptions}
            />
            <AuditFilterSelect
              id="audit-action"
              label="작업 유형"
              value={filters.action}
              onChange={(value) => setFilters({ ...filters, action: value === 'ALL' ? '' : value })}
              options={actionOptions}
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
                aria-describedby="audit-period-help"
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
                  <RangeCalendar aria-label="감사로그 기간 선택">
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
              id="audit-period-help"
              className={`text-sm lg:col-start-1 lg:row-start-2 ${rangeError ? 'text-danger' : 'text-muted'}`}
              role={rangeError ? 'alert' : undefined}
            >
              {rangeError ?? '기본 조회 기간은 최근 1일입니다.'}
            </p>
            <div className="flex gap-2 lg:col-start-2 lg:row-start-1">
              <Button type="submit" className="min-h-11 flex-1" isDisabled={Boolean(rangeError)}>
                조회
              </Button>
              <Button type="button" variant="secondary" className="min-h-11" onPress={reset}>
                초기화
              </Button>
            </div>
          </div>
        </Form>

        <div className="overflow-hidden rounded-xl">
          <Table>
            <Table.Content
              aria-label="감사로그 목록"
              onRowAction={(key) => setSelected(rows.find((item) => String(item.auditId) === String(key)))}
            >
              <Table.Header>
                <Table.Column id="createdAt">일시</Table.Column>
                <Table.Column id="createdBy">작업자</Table.Column>
                <Table.Column id="site">사이트</Table.Column>
                <Table.Column id="target" isRowHeader>
                  대상
                </Table.Column>
                <Table.Column id="action">작업</Table.Column>
                <Table.Column id="reason">사유</Table.Column>
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
                      <Table.Row id={String(item.auditId)} className="cursor-pointer">
                        <Table.Cell>{new Date(item.createdAt).toLocaleString()}</Table.Cell>
                        <Table.Cell>{item.createdBy}</Table.Cell>
                        <Table.Cell>{item.targetSiteId ?? '-'}</Table.Cell>
                        <Table.Cell>
                          <span className="font-medium">{targetTypeLabels[item.targetType] ?? item.targetType}</span>
                          <br />
                          <span className="text-xs text-muted">{item.targetId}</span>
                        </Table.Cell>
                        <Table.Cell>
                          <Chip size="sm" variant="soft">
                            {actionLabels[item.action] ?? item.action}
                          </Chip>
                        </Table.Cell>
                        <Table.Cell>
                          <span className="line-clamp-2 max-w-80">{item.reason}</span>
                        </Table.Cell>
                      </Table.Row>
                    )}
                  </Table.Collection>
                )}
              </Table.Body>
            </Table.Content>
          </Table>
          {!loading && rows.length === 0 && (
            <p className="p-8 text-center text-sm text-muted">조건에 맞는 데이터가 없습니다.</p>
          )}
        </div>
        {result.totalPages > 1 && (
          <Pagination className="mt-5 justify-center" aria-label="감사로그 목록 페이지">
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
                  <Modal.Heading>변경 상세</Modal.Heading>
                </Modal.Header>
                <Modal.Body className="flex flex-col gap-4">
                  {selected && (
                    <>
                      <dl className="grid gap-2 text-sm sm:grid-cols-[7rem_1fr]">
                        <dt className="text-muted">작업 유형</dt>
                        <dd>
                          <Chip size="sm" variant="soft">
                            {actionLabels[selected.action] ?? selected.action ?? '-'}
                          </Chip>
                        </dd>
                        <dt className="text-muted">변경 위치</dt>
                        <dd className="min-w-0 break-all font-mono text-xs">{selected.sourcePath || '-'}</dd>
                        <dt className="text-muted">변경대상</dt>
                        <dd>
                          {targetTypeLabels[selected.targetType] ?? selected.targetType ?? '-'}
                          <span className="ml-2 break-all font-mono text-xs text-muted">
                            {selected.targetId ?? '-'}
                          </span>
                        </dd>
                        <dt className="text-muted">작업자 / IP</dt>
                        <dd>
                          {selected.createdBy} / {selected.createdIp}
                        </dd>
                        <dt className="text-muted">변경 일시</dt>
                        <dd>{new Date(selected.createdAt).toLocaleString()}</dd>
                        <dt className="text-muted">변경 사유</dt>
                        <dd className="whitespace-pre-wrap">{selected.reason}</dd>
                      </dl>
                      <ChangeDiff changes={parseChanges(selected.changeDetail)} />
                    </>
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
