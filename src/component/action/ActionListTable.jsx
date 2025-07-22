import { Chip, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/react';
import { useCallback } from 'react';
import ActionDefaultRuleTypeChip from './ActionDefaultRuleTypeChip.jsx';
import ActionUrl from './ActionUrl.jsx';
import { toDateHtml } from '../../util/dateUtil.jsx';
import ActionTypeChip from './ActionTypeChip.jsx';

const columns = [
  { name: 'ID', uid: 'id' },
  { name: '이름', uid: 'name' },
  { name: 'URL', uid: 'actionUrl' },
  { name: '액션유형', uid: 'actionType' },
  { name: '기본 룰 유형', uid: 'defaultRuleType' },
  { name: '수정일자', uid: 'updatedAt' },
];

export default function ActionListTable({ actions, onPress }) {
  const renderCell = useCallback((action, columnKey) => {
    const cellValue = action[columnKey];
    switch (columnKey) {
      case 'description':
        return (
          <div className="flex flex-col">
            <span className="text-base font-medium">{action.name} </span>
            <span className="text-sm text-default-500">{cellValue}</span>
          </div>
        );
      case 'actionType':
        return <ActionTypeChip type={cellValue} />;
      case 'actionUrl':
        return <ActionUrl action={action} />;
      case 'defaultRuleType':
        return <ActionDefaultRuleTypeChip type={cellValue} />;
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
        selectionMode="single"
        aria-label="액션 목록 테이블"
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
          {actions?.map((action) => (
            <TableRow key={action.id} className="cursor-pointer">
              {columns.map((column) => (
                <TableCell key={column.uid}>{renderCell(action, column.uid)}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
