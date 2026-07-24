import { Chip, Pagination, SearchField, Skeleton, Table } from '@heroui/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { SiteClient } from '../../api/site/index.js';
import { ToastUtil } from '../../util/toastUtil.js';

const PAGE_SIZE = 10;
const columns = [
  { name: '사이트', uid: 'site' },
  { name: '설명', uid: 'description' },
  { name: '상태', uid: 'enabled' },
];

export default function SiteListTable() {
  const [sites, setSites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inputQuery, setInputQuery] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageData, setPageData] = useState({ page: 1, size: PAGE_SIZE, totalElements: 0, totalPages: 0, query: '' });
  const generationRef = useRef(0);
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
    const generation = ++generationRef.current;
    SiteClient.getSites({ page, size: PAGE_SIZE, query, signal: controller.signal })
      .then(({ data = {} }) => {
        if (generation !== generationRef.current) return;
        setSites(Array.isArray(data.content) ? data.content : []);
        setPageData({
          page: data.page ?? page,
          size: data.size ?? PAGE_SIZE,
          totalElements: data.totalElements ?? 0,
          totalPages: data.totalPages ?? 0,
          query,
        });
        if (data.page && data.page !== page) setPage(data.page);
      })
      .catch((error) => {
        if (error.code !== 'ERR_CANCELED' && generation === generationRef.current) {
          console.error(error);
          ToastUtil.error('사이트 관리', '사이트 목록을 불러오지 못했습니다.');
        }
      })
      .finally(() => {
        if (generation === generationRef.current) setIsLoading(false);
      });
    return () => controller.abort();
  }, [page, query]);

  const pageItems = useMemo(() => {
    const total = pageData.totalPages;
    if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
    const nearby = [1, pageData.page - 1, pageData.page, pageData.page + 1, total]
      .filter((value) => value >= 1 && value <= total)
      .filter((value, index, values) => values.indexOf(value) === index)
      .sort((a, b) => a - b);
    return nearby.flatMap((value, index) =>
      index > 0 && value - nearby[index - 1] > 1 ? [`ellipsis-${nearby[index - 1]}`, value] : [value]
    );
  }, [pageData]);

  if (isLoading) return <Skeleton className="h-80 w-full rounded-xl" />;
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-3">
        <SearchField name="site-search" value={inputQuery} onChange={setInputQuery} variant="secondary">
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input className="w-[280px]" placeholder="사이트 ID, 이름 또는 설명으로 검색" />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        <p className="text-sm text-muted">{isFetching ? '불러오는 중…' : `총 ${pageData.totalElements}개`}</p>
      </div>
      <Table>
        <Table.Content aria-label="사이트 목록" onRowAction={(key) => navigate(`/sites/${key}`)}>
          <Table.Header columns={columns}>
            {(column) => <Table.Column id={column.uid}>{column.name}</Table.Column>}
          </Table.Header>
          <Table.Body>
            <Table.Collection items={sites}>
              {(site) => (
                <Table.Row id={site.siteId} className="cursor-pointer">
                  {columns.map((column) => (
                    <Table.Cell key={column.uid}>
                      {column.uid === 'site' ? (
                        <div className="flex flex-col">
                          <span className="font-medium">{site.siteName}</span>
                          <span className="text-xs text-muted">{site.siteId}</span>
                        </div>
                      ) : column.uid === 'description' ? (
                        site.siteDescription || '-'
                      ) : (
                        <Chip color={site.siteEnabled ? 'success' : 'default'} variant="soft" size="sm">
                          {site.siteEnabled ? '활성' : '비활성'}
                        </Chip>
                      )}
                    </Table.Cell>
                  ))}
                </Table.Row>
              )}
            </Table.Collection>
          </Table.Body>
        </Table.Content>
      </Table>
      {!isFetching && sites.length === 0 && (
        <div className="py-10 text-center text-sm text-muted">조건에 맞는 사이트가 없습니다.</div>
      )}
      {pageData.totalPages > 1 && (
        <Pagination className="justify-center" aria-label="사이트 목록 페이지">
          <Pagination.Summary>{`${(pageData.page - 1) * pageData.size + 1}-${Math.min(pageData.page * pageData.size, pageData.totalElements)} / ${pageData.totalElements}개`}</Pagination.Summary>
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
      )}
    </div>
  );
}
