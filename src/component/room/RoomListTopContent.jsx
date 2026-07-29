import { useNavigate } from 'react-router';
import { Button, ListBox, SearchField, Select } from '@heroui/react';
import { useCallback, useEffect, useState } from 'react';
import { useUserStore } from '../../store/user.jsx';

const environmentOptions = [
  { id: 'ALL', label: '전체 환경' },
  { id: 'LIVE', label: '운영 (LIVE)' },
  { id: 'DEV', label: '개발 (DEV)' },
];

const statusOptions = [
  { id: 'ALL', label: '전체 상태' },
  { id: 'ENABLED', label: '활성' },
  { id: 'DISABLED', label: '비활성' },
];

function FilterSelect({ label, value, onChange, options }) {
  return (
    <Select aria-label={label} value={value} onChange={onChange} className="w-full sm:w-36" variant="secondary">
      <Select.Trigger>
        <Select.Value>{({ state }) => state.selectedItems[0]?.textValue}</Select.Value>
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover isNonModal>
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

export default function RoomListTopContent({ filters, onFiltersChange }) {
  const navigate = useNavigate();
  const role = useUserStore((state) => state.user?.userRole ?? state.user?.role);
  const canManageRooms = role === 'SITE_ADMIN' || role === 'SUPER';
  const [searchQuery, setSearchQuery] = useState(filters.search ?? '');

  const updateFilter = useCallback(
    (key, value) => onFiltersChange((current) => ({ ...current, [key]: value })),
    [onFiltersChange]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => updateFilter('search', searchQuery), 400);
    return () => window.clearTimeout(timer);
  }, [searchQuery, updateFilter]);

  return (
    <div className="mb-4 flex flex-col gap-3">
      <div className="flex flex-col items-stretch justify-between gap-3 lg:flex-row lg:items-end">
        <SearchField
          name="search"
          value={searchQuery}
          onChange={setSearchQuery}
          className="w-full lg:max-w-sm"
          variant="secondary"
        >
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="ID, 대기열 이름 또는 설명으로 검색" />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
          <FilterSelect
            label="대기열 환경 필터"
            value={filters.environment}
            onChange={(value) => updateFilter('environment', value)}
            options={environmentOptions}
          />
          <FilterSelect
            label="대기열 상태 필터"
            value={filters.status}
            onChange={(value) => updateFilter('status', value)}
            options={statusOptions}
          />
          {canManageRooms && (
            <Button className="col-span-2 min-h-11 w-full sm:w-auto" onPress={() => navigate('/rooms/new')}>
              대기열 추가
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
