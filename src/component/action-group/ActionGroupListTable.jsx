import { useCallback, useState, useEffect } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/react';
import { getActionGroupList } from '../../api/action-group/index.js';
import ActionGroupStatusChip from './ActionGroupStatusChip.jsx';
import { toDateHtml } from '../../util/dateUtil.jsx';

const columns = [
  { name: 'ID', uid: 'id' },
  { name: '이름', uid: 'description' },
  { name: '활성/비활성', uid: 'enabled' },
  { name: '최대 활성사용자 수', uid: 'maxActiveCustomers' },
  { name: '수정일자', uid: 'updatedAt' },
];

export default function ActionGroupListTable({ onPress }) {
  const [actionGroups, setActionGroups] = useState([]);

  useEffect(() => {
    const fetchActionGroupList = async () => {
      try {
        const data = await getActionGroupList();
        setActionGroups(Array.isArray(data) ? data : []);
      } catch (error) {
        setActionGroups([]);
      }
    };
    fetchActionGroupList();
  }, []);

  const renderCell = useCallback((actionGroup, columnKey) => {
    const cellValue = actionGroup[columnKey];
    switch (columnKey) {
      case 'description':
        return (
          <div className="flex flex-col">
            <span className="text-base font-medium">{actionGroup.name} </span>
            <span className="text-sm text-default-500">{cellValue}</span>
          </div>
        );
      case 'enabled':
        return <ActionGroupStatusChip enabled={cellValue} />;
      case 'updatedAt':
        return toDateHtml(cellValue);
      default:
        return cellValue;
    }
  }, []);

  return (
    <>
      <Table
        removeWrapper
        selectionBehavior="toggle"
        selectionMode="multiple"
        // onRowAction={(key) => alert(`Opening item ${key}...`)}

        onRowAction={(key) => onPress(key)}
        style={{ padding: 0, margin: 0 }}
      >
        <TableHeader columns={columns} style={{ padding: 0, margin: 0 }}>
          {(column) => (
            <TableColumn key={column.uid} align={column.uid === 'actions' ? 'center' : 'start'}>
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody>
          {actionGroups.map((actionGroup) => (
            <TableRow key={actionGroup.id} className="cursor-pointer">
              {columns.map((column) => (
                <TableCell key={column.uid}>{renderCell(actionGroup, column.uid)}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
