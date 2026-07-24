import { Chip, Pagination, SearchField, Skeleton, Surface, Table } from '@heroui/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { UserClient } from '../../api/user/index.js';
import { ToastUtil } from '../../util/toastUtil.js';

const columns = [
  { name: '사용자', uid: 'user' },
  { name: '사이트', uid: 'site' },
  { name: '역할', uid: 'role' },
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

const PAGE_SIZE = 10;

function Summary({ statusCounts, status, label }) {
  const count = statusCounts[status] ?? 0;
  return (
    <Surface className="min-w-36 rounded-xl border border-separator px-4 py-3">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{count}</p>
    </Surface>
  );
}

export default function UserListTable() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inputQuery, setInputQuery] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageData, setPageData] = useState({
    page: 1,
    size: PAGE_SIZE,
    totalElements: 0,
    totalPages: 0,
    statusCounts: {},
    query: '',
  });
  const requestGeneration = useRef(0);
  const navigate = useNavigate();
  const isFetching = isLoading || page !== pageData.page || query !== pageData.query;

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
    UserClient.getUsers({ page, size: PAGE_SIZE, query, signal: controller.signal })
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
    return () => {
      controller.abort();
    };
  }, [page, query]);

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

  const renderCell = (user, columnKey) => {
    switch (columnKey) {
      case 'user':
        return (
          <div className="flex flex-col">
            <span className="font-medium">{user.username}</span>
            <span className="text-xs text-muted">
              {user.userId} · {user.userEmail}
            </span>
          </div>
        );
      case 'site':
        return (
          <div className="flex flex-col">
            <span>{user.siteName || user.siteId}</span>
            <span className="text-xs text-muted">{user.siteId}</span>
          </div>
        );
      case 'role':
        return roleLabels[user.userRole] ?? user.userRole;
      case 'status': {
        const status = statusConfig[user.accountStatus] ?? { label: user.accountStatus, color: 'default' };
        return (
          <Chip color={status.color} variant="soft" size="sm">
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

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-3">
        <Summary statusCounts={pageData.statusCounts} status="PENDING" label="승인 대기" />
        <Summary statusCounts={pageData.statusCounts} status="ACTIVE" label="활성 계정" />
        <Summary statusCounts={pageData.statusCounts} status="DISABLED" label="비활성 계정" />
      </div>

      <div className="flex items-end justify-between gap-3">
        <SearchField name="user-search" value={inputQuery} onChange={setInputQuery} variant="secondary">
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input className="w-[280px]" placeholder="이름, ID, 이메일, 사이트로 검색" />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        <p className="text-sm text-muted">{isFetching ? '불러오는 중…' : `총 ${pageData.totalElements}명`}</p>
      </div>

      <Table>
        <Table.Content aria-label="사용자 목록" onRowAction={(key) => navigate(`/users/${key}`)}>
          <Table.Header columns={columns}>
            {(column) => <Table.Column id={column.uid}>{column.name}</Table.Column>}
          </Table.Header>
          <Table.Body>
            <Table.Collection items={users}>
              {(user) => (
                <Table.Row id={user.userId} className="cursor-pointer">
                  {columns.map((column) => (
                    <Table.Cell key={column.uid}>{renderCell(user, column.uid)}</Table.Cell>
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
          <Pagination.Summary>
            {pageData.totalElements === 0
              ? '0명'
              : `${(pageData.page - 1) * pageData.size + 1}-${Math.min(pageData.page * pageData.size, pageData.totalElements)} / ${pageData.totalElements}명`}
          </Pagination.Summary>
          <Pagination.Content>
            <Pagination.Item>
              <Pagination.Previous
                isDisabled={isFetching || pageData.page === 1}
                onPress={() => setPage((value) => Math.max(1, value - 1))}
              >
                <Pagination.PreviousIcon /> 이전
              </Pagination.Previous>
            </Pagination.Item>
            {pageItems.map((item) =>
              typeof item === 'string' ? (
                <Pagination.Item key={item}><Pagination.Ellipsis /></Pagination.Item>
              ) : (
                <Pagination.Item key={item}>
                  <Pagination.Link isActive={item === pageData.page} isDisabled={isFetching} onPress={() => setPage(item)}>
                    {item}
                  </Pagination.Link>
                </Pagination.Item>
              )
            )}
            <Pagination.Item>
              <Pagination.Next
                isDisabled={isFetching || pageData.page === pageData.totalPages}
                onPress={() => setPage((value) => Math.min(pageData.totalPages, value + 1))}
              >
                다음 <Pagination.NextIcon />
              </Pagination.Next>
            </Pagination.Item>
          </Pagination.Content>
        </Pagination>
      )}
    </div>
  );
}
