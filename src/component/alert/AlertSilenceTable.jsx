import { Button, Chip, ListBox, Pagination, Select, Spinner, Table } from '@heroui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertClient } from '../../api/alert/index.js';
import { useUserStore } from '../../store/user.jsx';
import ConfirmAlertDialog from '../ConfirmAlertDialog.jsx';
import { ToastUtil } from '../../util/toastUtil.js';
import AlertSilenceFormModal from './AlertSilenceFormModal.jsx';

const PAGE_SIZE = 10;
const DEFAULT_SYSTEMS = [
  { systemCode: 'QUEUE', label: '대기열' },
  { systemCode: 'SCHEDULER', label: '스케줄러' },
  { systemCode: 'DOCKER', label: 'Docker 컨테이너' },
  { systemCode: 'REDIS', label: 'Redis' },
  { systemCode: 'HOST', label: '호스트' },
  { systemCode: 'TARGET', label: 'Prometheus 수집' },
];
const STATUS_OPTIONS = [
  { id: 'ALL', label: '전체' },
  { id: 'ACTIVE', label: '적용 중' },
  { id: 'SCHEDULED', label: '예정' },
  { id: 'ENDED', label: '종료' },
  { id: 'CANCELLED', label: '취소' },
];
const STATUS_LABELS = {
  ACTIVE: '적용 중',
  SCHEDULED: '예정',
  ENDED: '종료',
  CANCELLED: '취소',
};

const formatMinute = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const pad = (part) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
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

export default function AlertSilenceTable() {
  const role = useUserStore((state) => state.user?.userRole ?? state.user?.role);
  const canManage = role === 'SUPER';
  const [systemCode, setSystemCode] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ content: [], totalPages: 0, totalElements: 0, systems: [] });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [cancelling, setCancelling] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(
    (signal) => {
      AlertClient.getAlertSilences({ page, size: PAGE_SIZE, systemCode, status, signal })
        .then(({ data }) =>
          setResult({
            content: data?.content ?? [],
            totalPages: data?.totalPages ?? 0,
            totalElements: data?.totalElements ?? 0,
            systems: data?.systems ?? [],
          })
        )
        .catch((error) => {
          if (error.code !== 'ERR_CANCELED') {
            ToastUtil.error('플랜다운', error.response?.data?.detail ?? '플랜다운 목록을 불러오지 못했습니다.');
          }
        })
        .finally(() => {
          if (!signal.aborted) setLoading(false);
        });
    },
    [page, systemCode, status]
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load, reloadKey]);

  const rows = result.content;
  const pageItems = useMemo(() => pageItemsOf(result.totalPages, page), [page, result.totalPages]);
  const systemOptions = useMemo(
    () => [
      { id: 'ALL', label: '전체' },
      ...(result.systems ?? []).map((system) => ({ id: system.systemCode, label: system.label })),
    ],
    [result.systems]
  );
  const systemLabels = useMemo(
    () => Object.fromEntries((result.systems ?? []).map((system) => [system.systemCode, system.label])),
    [result.systems]
  );

  const saved = () => {
    setIsFormOpen(false);
    setEditing(null);
    setLoading(true);
    setPage(1);
    setReloadKey((value) => value + 1);
  };

  const confirmCancel = async () => {
    if (!cancelling) return;
    try {
      await AlertClient.cancelAlertSilence(cancelling.silenceId);
      ToastUtil.success('플랜다운', '플랜다운을 취소했습니다.');
      setLoading(true);
      setReloadKey((value) => value + 1);
    } catch (error) {
      ToastUtil.error('플랜다운', error.response?.data?.detail ?? '플랜다운을 취소하지 못했습니다.');
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-2">
          <FilterSelect
            id="silence-filter-system"
            label="시스템"
            value={systemCode}
            onChange={(value) => {
              setLoading(true);
              setPage(1);
              setSystemCode(value === 'ALL' ? '' : value);
            }}
            options={systemOptions}
          />
          <FilterSelect
            id="silence-filter-status"
            label="상태"
            value={status}
            onChange={(value) => {
              setLoading(true);
              setPage(1);
              setStatus(value === 'ALL' ? '' : value);
            }}
            options={STATUS_OPTIONS}
          />
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <p className="text-sm text-muted">{loading ? '불러오는 중…' : `총 ${result.totalElements}개`}</p>
          {canManage && (
            <Button
              onPress={() => {
                setEditing(null);
                setIsFormOpen(true);
              }}
            >
              등록
            </Button>
          )}
        </div>
      </div>

      <Table>
        <Table.Content aria-label="플랜다운 목록">
          <Table.Header>
            <Table.Column id="system" isRowHeader>
              시스템
            </Table.Column>
            <Table.Column id="period">기간</Table.Column>
            <Table.Column id="status">상태</Table.Column>
            <Table.Column id="comment">사유</Table.Column>
            <Table.Column id="createdBy">등록자</Table.Column>
            {canManage && <Table.Column id="actions">동작</Table.Column>}
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
                {(item) => {
                  const editable = item.status === 'ACTIVE' || item.status === 'SCHEDULED';
                  return (
                    <Table.Row id={String(item.silenceId)}>
                      <Table.Cell>{systemLabels[item.systemCode] ?? item.systemCode}</Table.Cell>
                      <Table.Cell>{`${formatMinute(item.startsAt)} ~ ${formatMinute(item.endsAt)}`}</Table.Cell>
                      <Table.Cell>
                        <Chip size="sm" variant="soft" color={item.status === 'ACTIVE' ? 'warning' : 'default'}>
                          {STATUS_LABELS[item.status] ?? item.status}
                        </Chip>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="line-clamp-2 max-w-60">{item.comment || '-'}</span>
                      </Table.Cell>
                      <Table.Cell>{item.createdBy}</Table.Cell>
                      {canManage && (
                        <Table.Cell>
                          {editable && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onPress={() => {
                                  setEditing(item);
                                  setIsFormOpen(true);
                                }}
                              >
                                수정
                              </Button>
                              <Button size="sm" variant="danger" onPress={() => setCancelling(item)}>
                                취소
                              </Button>
                            </div>
                          )}
                        </Table.Cell>
                      )}
                    </Table.Row>
                  );
                }}
              </Table.Collection>
            )}
          </Table.Body>
        </Table.Content>
      </Table>
      {!loading && rows.length === 0 && (
        <div className="py-10 text-center text-sm text-muted">검색된 플랜다운이 없습니다</div>
      )}
      {result.totalPages > 1 && (
        <Pagination className="justify-center" aria-label="플랜다운 목록 페이지">
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
                    isDisabled={loading}
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
                <span className="hidden sm:inline">다음 </span>
                <Pagination.NextIcon />
              </Pagination.Next>
            </Pagination.Item>
          </Pagination.Content>
        </Pagination>
      )}

      <AlertSilenceFormModal
        isOpen={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditing(null);
        }}
        silence={editing}
        systems={result.systems.length > 0 ? result.systems : DEFAULT_SYSTEMS}
        onSaved={saved}
      />
      <ConfirmAlertDialog
        isOpen={cancelling !== null}
        onOpenChange={(open) => !open && setCancelling(null)}
        title="플랜다운 취소"
        message="플랜다운을 취소할까요?"
        confirmMessage="취소"
        onConfirm={confirmCancel}
      />
    </div>
  );
}

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
