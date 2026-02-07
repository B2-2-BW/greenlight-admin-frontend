import { useCallback, useState, useEffect } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/react';
import RoomStatusChip from './RoomStatusChip.jsx';
import { toDateHtml } from '../../util/dateUtil.jsx';
import { ActionGroupClient } from '../../api/action-group/index.js';
import { RoomClient } from '../../api/room/index.js';

const columns = [
  { name: '이름', uid: 'description' },
  { name: '활성/비활성', uid: 'enabled' },
  { name: '최대사용자수', uid: 'capacity' },
  { name: '수정일자', uid: 'updatedAt' },
];

export default function RoomListTable({ onPress }) {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchRoomList = async () => {
      try {
        const data = await RoomClient.getRoomList();
        setRooms(Array.isArray(data) ? data : []);
      } catch (error) {
        setRooms([]);
      }
    };
    fetchRoomList();
  }, []);

  const renderCell = useCallback((room, columnKey) => {
    const cellValue = room[columnKey];
    switch (columnKey) {
      case 'description':
        return (
          <div className="flex flex-col">
            <span className="text-base font-medium">{room.name} </span>
            <span className="text-sm text-default-500">{cellValue}</span>
          </div>
        );
      case 'enabled':
        return <RoomStatusChip enabled={cellValue} />;
      case 'updatedAt':
        return toDateHtml(cellValue);
      case 'maxTrafficPerSecond':
        return (
          <div>
            <span>{cellValue}</span>
            <span className="ml-1 text-xs text-neutral-500">{cellValue === 0 ? '(진입불가)' : ''}</span>
          </div>
        );
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
        aria-label="테이블"
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
          {rooms.map((room) => (
            <TableRow key={room.roomId} className="cursor-pointer">
              {columns.map((column) => (
                <TableCell key={column.uid}>{renderCell(room, column.uid)}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
