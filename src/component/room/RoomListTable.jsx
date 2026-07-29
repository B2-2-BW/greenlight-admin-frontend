import { useEffect, useMemo, useRef, useState } from 'react';
import { Pagination, Spinner, Table } from '@heroui/react';
import RoomStatusChip from './RoomStatusChip.jsx';
import { RoomClient } from '../../api/room/index.js';

const columns = [
  { name: 'ID', uid: 'roomId' },
  { name: '대기열', uid: 'name' },
  { name: '환경', uid: 'roomEnvironment' },
  { name: '상태', uid: 'enabled' },
  { name: '최대 사용자', uid: 'capacity' },
  { name: '초당 진입', uid: 'maxTrafficPerSecond' },
];

const environmentLabels = { LIVE: '운영', DEV: '개발' };
const PAGE_SIZE = 10;

export default function RoomListTable({ onPress, filters }) {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageData, setPageData] = useState({ page: 1, size: PAGE_SIZE, totalElements: 0, totalPages: 0 });
  const requestGeneration = useRef(0);
  const { search: query, environment, status } = filters;
  const isFetching = isLoading || page !== pageData.page;

  useEffect(() => {
    const controller = new AbortController();
    const generation = ++requestGeneration.current;
    RoomClient.getRoomPage({
      page,
      size: PAGE_SIZE,
      query: query || undefined,
      roomEnvironment: environment === 'ALL' ? undefined : environment,
      enabled: status === 'ALL' ? undefined : status === 'ENABLED',
      signal: controller.signal,
    })
      .then((response) => {
        if (generation !== requestGeneration.current) return;
        const data = response.data ?? {};
        setRooms(Array.isArray(data.content) ? data.content : []);
        setPageData({
          page: data.page ?? page,
          size: data.size ?? PAGE_SIZE,
          totalElements: data.totalElements ?? 0,
          totalPages: data.totalPages ?? 0,
        });
        if (data.page && data.page !== page) setPage(data.page);
      })
      .catch((error) => {
        if (error.code === 'ERR_CANCELED' || generation !== requestGeneration.current) return;
        console.error('Failed to load rooms:', error);
        setRooms([]);
      })
      .finally(() => {
        if (generation === requestGeneration.current) setIsLoading(false);
      });
    return () => controller.abort();
  }, [page, query, environment, status]);

  const pageItems = useMemo(() => {
    const total = pageData.totalPages;
    if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
    const nearby = [1, pageData.page - 1, pageData.page, pageData.page + 1, total]
      .filter((value) => value >= 1 && value <= total)
      .filter((value, index, values) => values.indexOf(value) === index)
      .sort((a, b) => a - b);
    return nearby.flatMap((value, index) => {
      const previous = nearby[index - 1];
      return index > 0 && value - previous > 1 ? [`ellipsis-${previous}`, value] : [value];
    });
  }, [pageData.page, pageData.totalPages]);

  const renderCell = (room, columnKey) => {
    switch (columnKey) {
      case 'name':
        return (
          <div className="flex max-w-sm flex-col">
            <span className="font-medium">{room.name}</span>
            <span className="truncate text-sm text-muted">{room.description || '설명 없음'}</span>
          </div>
        );
      case 'roomEnvironment':
        return environmentLabels[room.roomEnvironment] ?? room.roomEnvironment;
      case 'enabled':
        return <RoomStatusChip enabled={room.enabled} />;
      case 'maxTrafficPerSecond':
        return `${room.maxTrafficPerSecond ?? 0}명/초`;
      default:
        return room[columnKey] ?? '-';
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">{isFetching ? '불러오는 중…' : `총 ${pageData.totalElements}개`}</p>
      <div className="hidden md:block">
        {!isLoading && rooms.length === 0 ? (
          <div className="flex min-h-40 items-center justify-center rounded-2xl border border-neutral-200 bg-white px-4 text-center text-sm text-muted">
            조건에 맞는 대기열이 없습니다.
          </div>
        ) : (
          <Table aria-label="대기열 목록">
            <Table.Content onRowAction={onPress}>
              <Table.Header columns={columns}>
                {(column) => (
                  <Table.Column id={column.uid} isRowHeader={column.uid === 'roomId'}>
                    {column.name}
                  </Table.Column>
                )}
              </Table.Header>
              <Table.Body>
                {isLoading ? (
                  <Table.LoadMore isLoading>
                    <Table.LoadMoreContent>
                      <Spinner color="accent" size="md" />
                    </Table.LoadMoreContent>
                  </Table.LoadMore>
                ) : (
                  <Table.Collection items={rooms}>
                    {(room) => (
                      <Table.Row id={room.roomId} className="cursor-pointer">
                        {columns.map((column) => (
                          <Table.Cell key={column.uid}>{renderCell(room, column.uid)}</Table.Cell>
                        ))}
                      </Table.Row>
                    )}
                  </Table.Collection>
                )}
              </Table.Body>
            </Table.Content>
          </Table>
        )}
      </div>
      <div className="flex flex-col gap-3 md:hidden" aria-label="대기열 목록">
        {isLoading && (
          <div className="flex min-h-40 items-center justify-center rounded-2xl border border-neutral-200 bg-white">
            <Spinner color="accent" size="md" />
          </div>
        )}
        {!isLoading &&
          rooms.map((room) => (
            <button
              key={room.roomId}
              type="button"
              className="min-h-28 w-full rounded-2xl border border-neutral-200 bg-white p-4 text-left shadow-sm transition-colors active:bg-neutral-100"
              onClick={() => onPress(room.roomId)}
            >
              <span className="flex min-w-0 items-start justify-between gap-3">
                <span className="min-w-0">
                  <span className="block truncate text-base font-semibold">{room.name}</span>
                  <span className="mt-0.5 block truncate text-xs text-muted">{room.roomId}</span>
                </span>
                <RoomStatusChip enabled={room.enabled} />
              </span>
              <span className="mt-3 block truncate text-sm text-muted">{room.description || '설명 없음'}</span>
              <span className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <span>{environmentLabels[room.roomEnvironment] ?? room.roomEnvironment}</span>
                <span>최대 {room.capacity ?? '-'}명</span>
                <span>초당 {room.maxTrafficPerSecond ?? 0}명</span>
              </span>
            </button>
          ))}
        {!isLoading && rooms.length === 0 && (
          <div className="flex min-h-40 items-center justify-center rounded-2xl border border-neutral-200 bg-white px-4 text-center text-sm text-muted">
            조건에 맞는 대기열이 없습니다.
          </div>
        )}
      </div>
      {pageData.totalPages > 1 && (
        <>
          <Pagination className="hidden justify-center md:flex" aria-label="대기열 목록 페이지">
            <Pagination.Summary>
              {`${(pageData.page - 1) * pageData.size + 1}-${Math.min(pageData.page * pageData.size, pageData.totalElements)} / ${pageData.totalElements}개`}
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
                  isDisabled={isFetching || pageData.page === pageData.totalPages}
                  onPress={() => setPage((value) => Math.min(pageData.totalPages, value + 1))}
                >
                  다음 <Pagination.NextIcon />
                </Pagination.Next>
              </Pagination.Item>
            </Pagination.Content>
          </Pagination>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 md:hidden" aria-label="대기열 목록 페이지">
            <button
              type="button"
              className="min-h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              disabled={isFetching || pageData.page === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              이전
            </button>
            <span className="px-1 text-center text-sm text-muted">
              {pageData.page} / {pageData.totalPages}
            </span>
            <button
              type="button"
              className="min-h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              disabled={isFetching || pageData.page === pageData.totalPages}
              onClick={() => setPage((value) => Math.min(pageData.totalPages, value + 1))}
            >
              다음
            </button>
          </div>
        </>
      )}
    </div>
  );
}
