import { useNavigate } from 'react-router';
import { ChevronDownIcon, PlusIcon, SearchIcon } from '../../icon/Icons.jsx';
import { Button, Description, Dropdown, FieldError, Input, Label, SearchField, TextField } from '@heroui/react';
import { useState } from 'react';

// 이거는 기능 동작 필요 없어서 일단 무시
export default function RoomListTopContent() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');

  const onClickCreateButton = () => {
    navigate('/rooms/new');
  };

  return (
    <div className="flex flex-col mb-4">
      <div className="flex justify-between gap-3 items-end">
        <SearchField name="search" value={searchQuery} onChange={setSearchQuery} variant="secondary">
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input className="w-[280px]" placeholder="대기열 이름으로 검색하기 (개발중)" />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        <div className="flex gap-3">
          <Dropdown>
            <Button variant="secondary" className="text-neutral-700">
              Status
              <ChevronDownIcon className="text-small" />
            </Button>
            <Dropdown.Popover>
              <Dropdown.Menu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                // selectedKeys={statusFilter}
                selectionMode="multiple"
                // onSelectionChange={setStatusFilter}
              >
                {/*{statusOptions.map((status) => (*/}
                {/*    <DropdownItem key={status.uid} className="capitalize">*/}
                {/*        {capitalize(status.name)}*/}
                {/*    </DropdownItem>*/}
                {/*))}*/}
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
          <Button color="primary" onPress={onClickCreateButton}>
            추가하기
          </Button>
        </div>
      </div>
    </div>
  );
}
