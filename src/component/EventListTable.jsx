import { useCallback, useState, useEffect } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, User, Chip, Tooltip } from '@heroui/react';
import EventStatusChip from './EventStatusChip.jsx';
import { getEventList } from '../api/event/index.js';

export const columns = [
  { name: '이벤트', uid: 'eventName' },
  { name: '상태', uid: 'status' },
  { name: '시작일자', uid: 'eventStartTime' },
  { name: '종료일자', uid: 'eventEndTime' },
  { name: '수정일자', uid: 'updatedAt' },
];

const formatDate = (isoString) => {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const formatRelativeDate = (isoString) => {
  const date = new Date(isoString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  const intervals = [
    { label: '년', seconds: 31536000 },
    { label: '개월', seconds: 2592000 },
    { label: '일', seconds: 86400 },
    { label: '시간', seconds: 3600 },
    { label: '분', seconds: 60 },
    { label: '초', seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return `${count}${interval.label} 전`;
    }
  }

  return '방금 전';
};

const toDateHtml = (cellValue) => {
  return (
    <div className="flex flex-col">
      <p className="text-sm">{formatRelativeDate(cellValue)}</p>
      <p className="text-xs text-default-400">{formatDate(cellValue)}</p>
    </div>
  );
};
const renderEventStatusChip = (start, end) => {
  if (start == null || end == null) return;
  let now = new Date();
  let startDate = new Date(start);
  let endDate = new Date(end);
  if (now < startDate) {
    return <EventStatusChip status="upcoming" size="sm" />;
  } else if (now > endDate) {
    return <EventStatusChip status="closed" size="sm" />;
  }
  return <EventStatusChip status="open" size="sm" />;
};

export default function EventListTable({ onPress }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getEventList();
        setEvents(Array.isArray(data.events) ? data.events : []);
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
      }
    };
    fetchEvents();
  }, []);

  const renderCell = useCallback((event, columnKey) => {
    const cellValue = event[columnKey];

    switch (columnKey) {
      case 'eventName':
        return (
          <div className="flex flex-col">
            <span className="text-base font-medium">{event.eventDescription} </span>
            <span className="text-sm text-default-500">{cellValue}</span>
          </div>
        );
      case 'eventUrl':
        return (
          <div className="flex flex-col">
            <p className="text-bold text-xs">{cellValue}</p>
          </div>
        );
      case 'status':
        return renderEventStatusChip(event.eventStartTime, event.eventEndTime);
      case 'updatedAt':
        return toDateHtml(cellValue);
      case 'eventStartTime':
        return formatDate(cellValue);
      case 'eventEndTime':
        return formatDate(cellValue);
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
          {events.map((item) => (
            <TableRow key={item.eventName} className="cursor-pointer">
              {columns.map((column) => (
                <TableCell key={column.uid}>{renderCell(item, column.uid)}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
