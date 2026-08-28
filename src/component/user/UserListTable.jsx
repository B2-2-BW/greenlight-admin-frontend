import {
  Button,
  Checkbox,
  Chip,
  Label,
  ListBox,
  Modal,
  Pagination,
  SearchField,
  Select,
  Skeleton,
  Surface,
  Table,
  TextArea,
  TextField,
} from '@heroui/react';
import { EllipsisVertical } from '@gravity-ui/icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { UserClient } from '../../api/user/index.js';
import { useUserStore } from '../../store/user.jsx';
import { ToastUtil } from '../../util/toastUtil.js';
import { getVisibleSites } from '../../util/siteUtil.js';

const dataColumns = [
  { name: '사용자', uid: 'user', isRowHeader: true },
  { name: '사이트 권한', uid: 'site', className: 'hidden sm:table-cell' },
  { name: '역할', uid: 'role', className: 'hidden md:table-cell' },
  { name: '계정 상태', uid: 'status' },
];

const roleLabels = {
  SUPER: '슈퍼유저',
  SITE_ADMIN: '사이트 관리자',
  USER: '일반 사용자',
};

const statusConfig = {
  PENDING: { label: '승인 대기', color: 'warning' },
  ACTIVE: { label: '활성', color: 'success' },
  REJECTED: { label: '반려', color: 'danger' },
  DISABLED: { label: '비활성', color: 'default' },
};

const actionConfig = {
  APPROVE: {
    title: '선택한 사용자를 승인할까요?',
    submitLabel: '일괄 승인',
    reasonLabel: '승인 사유',
    reasonPlaceholder: '승인 사유를 입력해 주세요.',
    description: (count) => `선택한 ${count}명의 승인 사유를 감사로그에 기록합니다.`,
    variant: 'primary',
  },
  REJECT: {
    title: '선택한 가입 신청을 반려할까요?',
    submitLabel: '일괄 반려',
    reasonLabel: '반려 사유',
    reasonPlaceholder: '반려 사유를 입력해 주세요.',
    description: (count) => `선택한 ${count}명의 반려 사유를 감사로그에 기록합니다.`,
    variant: 'danger',
  },
  DISABLE: {
    title: '선택한 사용자를 비활성화할까요?',
    submitLabel: '일괄 비활성화',
    reasonLabel: '비활성화 사유',
    reasonPlaceholder: '비활성화 사유를 입력해 주세요.',
    description: (count) => `선택한 ${count}명의 비활성화 사유를 감사로그에 기록합니다.`,
    variant: 'danger',
  },
};

const PAGE_SIZE = 10;

function formatUserSites(user, viewer) {
  const sites = getVisibleSites(user, viewer);
  if (sites.length > 0) {
    return sites.map((site) => site.siteName || site.siteId).join(', ');
  }
  return user.siteName || user.siteId || '';
}

function formatUserSiteIds(user, viewer) {
  const sites = getVisibleSites(user, viewer);
  if (sites.length > 0) {
    return sites.map((site) => site.siteId).join(', ');
  }
  if (Array.isArray(user.siteIds) && user.siteIds.length > 0) {
    return user.siteIds.join(', ');
  }
  return user.siteId || '';
}

function FilterSelect({ label, value, onChange, options, className = 'w-full sm:w-40' }) {
  return (
    <Select aria-label={label} value={value} onChange={onChange} className={className} variant="secondary">
      <Select.Trigger>
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
  );
}

function SelectionCheckbox({ label }) {
  return (
    <Checkbox slot="selection" aria-label={label}>
      <Checkbox.Content>
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
      </Checkbox.Content>
    </Checkbox>
  );
}

function Summary({ statusCounts, status, label, isSelected, onPress }) {
  const count = statusCounts[status] ?? 0;
  return (
    <button type="button" className="min-w-0 text-left" onClick={onPress} aria-pressed={isSelected}>
      <Surface
        className={`h-full rounded-xl border px-4 py-3 transition-colors ${
          isSelected ? 'border-accent bg-accent/10' : 'border-separator'
        }`}
      >
        <p className="text-sm text-muted">{label}</p>
        <p className="mt-1 text-2xl font-semibold">{count}</p>
      </Surface>
    </button>
  );
}

export default function UserListTable() {
  const currentUser = useUserStore((state) => state.user);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inputQuery, setInputQuery] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [isEditMode, setIsEditMode] = useState(false);
  const [bulkAction, setBulkAction] = useState(null);
  const [reason, setReason] = useState('');
  const [isBulkPending, setIsBulkPending] = useState(false);
  const [refreshGeneration, setRefreshGeneration] = useState(0);
  const [pageData, setPageData] = useState({
    page: 1,
    size: PAGE_SIZE,
    totalElements: 0,
    totalPages: 0,
    statusCounts: {},
    query: '',
    status: 'ALL',
    role: 'ALL',
  });
  const requestGeneration = useRef(0);
  const navigate = useNavigate();
  const columns = isEditMode ? [{ name: '선택', uid: 'selection', className: 'w-12' }, ...dataColumns] : dataColumns;
  const isFetching =
    isLoading ||
    page !== pageData.page ||
    query !== pageData.query ||
    statusFilter !== pageData.status ||
    roleFilter !== pageData.role;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(inputQuery);
      setPage(1);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [inputQuery]);

  useEffect(() => {
    const controller = new AbortController();
    const generation = ++requestGeneration.current;
    UserClient.getUsers({
      page,
      size: PAGE_SIZE,
      query,
      status: statusFilter === 'ALL' ? undefined : statusFilter,
      role: roleFilter === 'ALL' ? undefined : roleFilter,
      signal: controller.signal,
    })
      .then((response) => {
        if (generation !== requestGeneration.current) return;
        const data = response.data ?? {};
        setUsers(Array.isArray(data.content) ? data.content : []);
        setPageData({
          page: data.page ?? page,
          size: data.size ?? PAGE_SIZE,
          totalElements: data.totalElements ?? 0,
          totalPages: data.totalPages ?? 0,
          statusCounts: data.statusCounts ?? {},
          query,
          status: statusFilter,
          role: roleFilter,
        });
        if (data.page && data.page !== page) setPage(data.page);
      })
      .catch((error) => {
        if (error.code === 'ERR_CANCELED' || generation !== requestGeneration.current) return;
        console.error(error);
        ToastUtil.error('사용자 관리', '사용자 목록을 불러오지 못했습니다.');
      })
      .finally(() => {
        if (generation === requestGeneration.current) {
          setIsLoading(false);
        }
      });
    return () => controller.abort();
  }, [page, query, refreshGeneration, roleFilter, statusFilter]);

  useEffect(() => {
    setSelectedKeys(new Set());
  }, [page, query, roleFilter, statusFilter]);

  const selectedUsers = useMemo(() => users.filter((user) => selectedKeys.has(user.userId)), [selectedKeys, users]);
  const disabledSelectionKeys = useMemo(
    () =>
      new Set(
        users
          .filter((user) => user.userRole === 'SUPER' || user.userId === currentUser?.userId)
          .map((user) => user.userId)
      ),
    [currentUser?.userId, users]
  );
  const canApprove = selectedUsers.length > 0 && selectedUsers.every((user) => user.accountStatus === 'PENDING');
  const canReject = canApprove;
  const canDisable =
    selectedUsers.length > 0 &&
    selectedUsers.every(
      (user) => user.accountStatus === 'ACTIVE' && user.userId !== currentUser?.userId && user.userRole !== 'SUPER'
    );

  const pageItems = useMemo(() => {
    const total = pageData.totalPages;
    if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
    const nearby = [1, pageData.page - 1, pageData.page, pageData.page + 1, total]
      .filter((value) => value >= 1 && value <= total)
      .filter((value, index, values) => values.indexOf(value) === index)
      .sort((a, b) => a - b);
    return nearby.flatMap((value, index) => {
      const previous = nearby[index - 1];
      return index > 0 && value - previous > 1 ? ['ellipsis-' + previous, value] : [value];
    });
  }, [pageData.page, pageData.totalPages]);

  const openBulkAction = (action) => {
    setReason('');
    setBulkAction(action);
  };

  const closeEditMode = () => {
    setIsEditMode(false);
    setSelectedKeys(new Set());
    setBulkAction(null);
    setReason('');
  };

  const submitBulkAction = async (event) => {
    event.preventDefault();
    if (!bulkAction || !reason.trim() || selectedUsers.length === 0) return;
    setIsBulkPending(true);
    try {
      await UserClient.bulkAction({
        userIds: selectedUsers.map((user) => user.userId),
        action: bulkAction,
        reason: reason.trim(),
      });
      ToastUtil.success('사용자 관리', `${selectedUsers.length}명의 상태를 변경했습니다.`);
      setBulkAction(null);
      setReason('');
      setSelectedKeys(new Set());
      setIsEditMode(false);
      setRefreshGeneration((generation) => generation + 1);
    } catch (error) {
      console.error(error);
      ToastUtil.error('일괄 처리 실패', error.response?.data?.detail ?? '선택한 사용자의 상태를 변경하지 못했습니다.');
    } finally {
      setIsBulkPending(false);
    }
  };

  const renderCell = (user, columnKey) => {
    switch (columnKey) {
      case 'selection':
        return <SelectionCheckbox label={`${user.username || user.userId} 선택`} />;
      case 'user':
        return (
          <div className="flex flex-col">
            <span className="font-medium">{user.username}</span>
            <span className="break-all text-xs text-muted">
              {user.userId} · {user.userEmail}
            </span>
            <span className="mt-1 text-xs text-muted sm:hidden">
              {formatUserSites(user, currentUser)} · {roleLabels[user.userRole] ?? user.userRole}
            </span>
          </div>
        );
      case 'site':
        return (
          <div className="flex flex-col">
            <span>{formatUserSites(user, currentUser)}</span>
            <span className="text-xs text-muted">{formatUserSiteIds(user, currentUser)}</span>
          </div>
        );
      case 'role':
        return roleLabels[user.userRole] ?? user.userRole;
      case 'status': {
        const status = statusConfig[user.accountStatus] ?? { label: user.accountStatus, color: 'default' };
        return (
          <Chip color={status.color} variant="soft" size="md">
            {status.label}
          </Chip>
        );
      }
      default:
        return null;
    }
  };

  if (isLoading) {
    return <Skeleton className="h-80 w-full rounded-xl" />;
  }

  const currentAction = bulkAction ? actionConfig[bulkAction] : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {Object.entries(statusConfig).map(([status, config]) => (
          <Summary
            key={status}
            statusCounts={pageData.statusCounts}
            status={status}
            label={config.label}
            isSelected={statusFilter === status}
            onPress={() => {
              setStatusFilter((current) => (current === status ? 'ALL' : status));
              setPage(1);
            }}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <SearchField name="user-search" value={inputQuery} onChange={setInputQuery} variant="secondary">
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input className="w-full sm:w-[280px]" placeholder="이름, ID, 이메일로 검색" />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <FilterSelect
            label="계정 상태"
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
            options={[
              { id: 'ALL', label: '전체 상태' },
              ...Object.entries(statusConfig).map(([id, config]) => ({ id, label: config.label })),
            ]}
          />
          <FilterSelect
            label="역할"
            value={roleFilter}
            onChange={(value) => {
              setRoleFilter(value);
              setPage(1);
            }}
            options={[
              { id: 'ALL', label: '전체 역할' },
              ...Object.entries(roleLabels).map(([id, label]) => ({ id, label })),
            ]}
          />
          <div className="flex items-center justify-end gap-2 sm:ml-auto">
            <p className="text-sm text-muted">{isFetching ? '불러오는 중…' : `총 ${pageData.totalElements}명`}</p>
            <Button
              size="sm"
              isIconOnly
              variant={isEditMode ? 'secondary' : 'ghost'}
              aria-label={isEditMode ? '다중 선택 편집 종료' : '다중 선택 편집'}
              onPress={() => (isEditMode ? closeEditMode() : setIsEditMode(true))}
            >
              <EllipsisVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {isEditMode && (
        <div className="flex flex-col gap-2 rounded-xl border border-separator p-3 sm:flex-row sm:items-center">
          <p className="text-sm font-medium sm:mr-auto">{selectedUsers.length}명 선택</p>
          <Button size="sm" isDisabled={!canApprove || isFetching} onPress={() => openBulkAction('APPROVE')}>
            일괄 승인
          </Button>
          <Button
            size="sm"
            variant="danger-soft"
            isDisabled={!canReject || isFetching}
            onPress={() => openBulkAction('REJECT')}
          >
            일괄 반려
          </Button>
          <Button
            size="sm"
            variant="danger-soft"
            isDisabled={!canDisable || isFetching}
            onPress={() => openBulkAction('DISABLE')}
          >
            일괄 비활성화
          </Button>
          <Button size="sm" variant="tertiary" isDisabled={isFetching} onPress={closeEditMode}>
            편집 취소
          </Button>
        </div>
      )}

      <Table>
        <Table.Content
          key={isEditMode ? 'user-table-edit' : 'user-table-view'}
          aria-label="사용자 목록"
          selectionMode={isEditMode ? 'multiple' : 'none'}
          selectionBehavior="toggle"
          selectedKeys={selectedKeys}
          disabledKeys={isEditMode ? disabledSelectionKeys : undefined}
          onSelectionChange={
            isEditMode
              ? (keys) =>
                  setSelectedKeys(
                    keys === 'all'
                      ? new Set(
                          users
                            .filter((user) => user.userRole !== 'SUPER' && user.userId !== currentUser?.userId)
                            .map((user) => user.userId)
                        )
                      : new Set([...keys].filter((key) => !disabledSelectionKeys.has(key)))
                  )
              : undefined
          }
          onRowAction={isEditMode ? undefined : (key) => navigate(`/users/${key}`)}
        >
          <Table.Header columns={columns}>
            {(column) => (
              <Table.Column id={column.uid} className={column.className} isRowHeader={column.isRowHeader}>
                {column.uid === 'selection' ? <SelectionCheckbox label="현재 페이지 사용자 전체 선택" /> : column.name}
              </Table.Column>
            )}
          </Table.Header>
          <Table.Body>
            <Table.Collection items={users}>
              {(user) => (
                <Table.Row id={user.userId} className={isEditMode ? undefined : 'cursor-pointer'}>
                  {columns.map((column) => (
                    <Table.Cell key={column.uid} className={column.className}>
                      {renderCell(user, column.uid)}
                    </Table.Cell>
                  ))}
                </Table.Row>
              )}
            </Table.Collection>
          </Table.Body>
        </Table.Content>
      </Table>

      {!isFetching && users.length === 0 && (
        <div className="py-10 text-center text-sm text-muted">조건에 맞는 사용자가 없습니다.</div>
      )}
      {pageData.totalPages > 1 && (
        <Pagination className="justify-center" aria-label="사용자 목록 페이지">
          <Pagination.Summary className="hidden sm:block">
            {pageData.totalElements === 0
              ? '0명'
              : `${(pageData.page - 1) * pageData.size + 1}-${Math.min(pageData.page * pageData.size, pageData.totalElements)} / ${pageData.totalElements}명`}
          </Pagination.Summary>
          <Pagination.Content>
            <Pagination.Item>
              <Pagination.Previous
                aria-label="이전 페이지"
                isDisabled={isFetching || pageData.page === 1}
                onPress={() => setPage((value) => Math.max(1, value - 1))}
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
                    isActive={item === pageData.page}
                    isDisabled={isFetching}
                    onPress={() => setPage(item)}
                  >
                    {item}
                  </Pagination.Link>
                </Pagination.Item>
              )
            )}
            <Pagination.Item>
              <Pagination.Next
                aria-label="다음 페이지"
                isDisabled={isFetching || pageData.page === pageData.totalPages}
                onPress={() => setPage((value) => Math.min(pageData.totalPages, value + 1))}
              >
                <span className="hidden sm:inline">다음 </span>
                <Pagination.NextIcon />
              </Pagination.Next>
            </Pagination.Item>
          </Pagination.Content>
        </Pagination>
      )}

      <Modal
        isOpen={bulkAction !== null}
        onOpenChange={(open) => {
          if (!open && !isBulkPending) setBulkAction(null);
        }}
      >
        <Modal.Backdrop isDismissable={!isBulkPending}>
          <Modal.Container size="sm">
            <Modal.Dialog className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-md">
              <Modal.CloseTrigger isDisabled={isBulkPending} />
              <Modal.Header>
                <Modal.Heading>{currentAction?.title}</Modal.Heading>
              </Modal.Header>
              <form onSubmit={submitBulkAction}>
                <Modal.Body className="flex flex-col gap-4">
                  <p className="text-sm text-muted">{currentAction?.description(selectedUsers.length)}</p>
                  <TextField isRequired name="reason">
                    <Label>{currentAction?.reasonLabel}</Label>
                    <TextArea
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      maxLength={1000}
                      rows={4}
                      placeholder={currentAction?.reasonPlaceholder}
                    />
                  </TextField>
                </Modal.Body>
                <Modal.Footer className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button slot="close" variant="tertiary" isDisabled={isBulkPending}>
                    취소
                  </Button>
                  <Button
                    type="submit"
                    variant={currentAction?.variant}
                    isDisabled={!reason.trim()}
                    isPending={isBulkPending}
                  >
                    {currentAction?.submitLabel}
                  </Button>
                </Modal.Footer>
              </form>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}
