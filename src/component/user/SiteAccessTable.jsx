import { Checkbox, Chip, Label, Skeleton, Table } from '@heroui/react';

const editableColumns = [
  { name: '선택', uid: 'selection', className: 'w-12' },
  { name: '사이트', uid: 'name', isRowHeader: true },
  { name: '사이트 ID', uid: 'siteId', className: 'hidden sm:table-cell' },
  { name: '상태', uid: 'status' },
];

const readonlyColumns = editableColumns.filter((column) => column.uid !== 'selection');

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

function toIdList(keys, sites) {
  if (keys === 'all') {
    return sites.map((site) => site.siteId);
  }
  return [...keys].map(String);
}

export default function SiteAccessTable({
  label = '사이트 권한',
  sites = [],
  selectedIds = [],
  onChange,
  isLoading = false,
  isDisabled = false,
  readOnly = false,
  hiddenCount = 0,
}) {
  const editable = Boolean(onChange) && !readOnly && !isDisabled;
  const columns = editable ? editableColumns : readonlyColumns;
  const visibleSelectedIds = (selectedIds ?? []).filter((siteId) =>
    sites.some((site) => site.siteId === siteId)
  );

  if (isLoading) {
    return (
      <div className="flex w-full max-w-2xl flex-col gap-2">
        <p className="text-base font-medium">{label}</p>
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <Label className="text-base">{label}</Label>
        {editable ? (
          <p className="text-sm text-muted">{visibleSelectedIds.length}개 선택</p>
        ) : null}
      </div>
      {sites.length === 0 ? (
        <div className="rounded-xl border border-separator py-10 text-center text-sm text-muted">
          부여할 수 있는 사이트가 없습니다.
        </div>
      ) : (
        <Table>
          <Table.Content
            aria-label={label}
            selectionMode={editable ? 'multiple' : 'none'}
            selectionBehavior="toggle"
            selectedKeys={editable ? new Set(visibleSelectedIds) : undefined}
            onSelectionChange={
              editable
                ? (keys) => {
                    onChange(toIdList(keys, sites));
                  }
                : undefined
            }
          >
            <Table.Header columns={columns}>
              {(column) => (
                <Table.Column id={column.uid} className={column.className} isRowHeader={column.isRowHeader}>
                  {column.uid === 'selection' ? <SelectionCheckbox label="사이트 전체 선택" /> : column.name}
                </Table.Column>
              )}
            </Table.Header>
            <Table.Body>
              <Table.Collection items={sites}>
                {(site) => (
                  <Table.Row id={site.siteId} className={editable ? 'cursor-pointer' : undefined}>
                    {columns.map((column) => (
                      <Table.Cell key={column.uid} className={column.className}>
                        {column.uid === 'selection' ? (
                          <SelectionCheckbox label={`${site.siteName || site.siteId} 선택`} />
                        ) : column.uid === 'name' ? (
                          <div className="flex flex-col">
                            <span className="font-medium">{site.siteName || site.siteId}</span>
                            <span className="text-xs text-muted sm:hidden">{site.siteId}</span>
                          </div>
                        ) : column.uid === 'siteId' ? (
                          site.siteId
                        ) : (
                          <Chip color={site.siteEnabled === false ? 'default' : 'success'} variant="soft" size="sm">
                            {site.siteEnabled === false ? '비활성' : '활성'}
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
      )}
      {hiddenCount > 0 ? (
        <p className="text-sm text-muted">이 계정이 가진 다른 사이트 {hiddenCount}개는 변경되지 않습니다.</p>
      ) : null}
      {editable && sites.length > 0 && visibleSelectedIds.length === 0 ? (
        <p className="text-sm text-danger">사이트를 하나 이상 선택해 주세요.</p>
      ) : null}
    </div>
  );
}
