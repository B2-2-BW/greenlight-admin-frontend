import { useNavigate } from 'react-router';
import { ChevronDownIcon, PlusIcon, SearchIcon } from '../../icon/Icons.jsx';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input } from '@heroui/react';

// 이거는 기능 동작 필요 없어서 일단 무시
export default function ActionGroupTopContent() {
  const navigate = useNavigate();

  const onClickCreateButton = () => {
    navigate('/action-groups/new');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-3 items-end">
        <Input
          isClearable
          className="w-full sm:max-w-[44%]"
          placeholder="액션 그룹 이름으로 검색하기"
          startContent={<SearchIcon />}
          // value={filterValue}
          // onClear={() => onClear()}
          // onValueChange={onSearchChange}
        />
        <div className="flex gap-3">
          <Dropdown>
            <DropdownTrigger className="hidden sm:flex">
              <Button endContent={<ChevronDownIcon className="text-small" />} variant="flat">
                Status
              </Button>
            </DropdownTrigger>
            <DropdownMenu
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
            </DropdownMenu>
          </Dropdown>
          <Dropdown>
            <DropdownTrigger className="hidden sm:flex">
              <Button endContent={<ChevronDownIcon className="text-small" />} variant="flat">
                Columns
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Table Columns"
              closeOnSelect={false}
              // selectedKeys={visibleColumns}
              selectionMode="multiple"
              // onSelectionChange={setVisibleColumns}
            >
              {/*{columns.map((column) => (*/}
              {/*    <DropdownItem key={column.uid} className="capitalize">*/}
              {/*        {capitalize(column.name)}*/}
              {/*    </DropdownItem>*/}
              {/*))}*/}
            </DropdownMenu>
          </Dropdown>
          <Button color="primary" onPress={onClickCreateButton} endContent={<PlusIcon />}>
            추가하기
          </Button>
        </div>
      </div>
      <div className="flex justify-between items-center">
        {/*<span className="text-default-400 text-small">Total {users.length} users</span>*/}
        {/*<label className="flex items-center text-default-400 text-small">*/}
        {/*  Rows per page:*/}
        {/*  <select*/}
        {/*    className="bg-transparent outline-none text-default-400 text-small"*/}
        {/*    // onChange={onRowsPerPageChange}*/}
        {/*  >*/}
        {/*    <option value="5">5</option>*/}
        {/*    <option value="10">10</option>*/}
        {/*    <option value="15">15</option>*/}
        {/*  </select>*/}
        {/*</label>*/}
      </div>
    </div>
  );
}
