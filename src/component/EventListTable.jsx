import { useCallback } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  User,
  Chip,
  Tooltip,
} from '@heroui/react';

export const columns = [
  { name: '이벤트명', uid: 'eventName' },
  { name: '유입량(초)', uid: 'queueBackpressure' },
  { name: '시작일자', uid: 'eventStartTime' },
  { name: '종료일자', uid: 'eventEndTime' },
  { name: '수정일자', uid: 'updatedAt' },
];

export const events = [
  {
    eventName: 'test',
    eventDescription: '테스트 이벤트',
    eventType: '타입',
    eventUrl:
      'https://www.thehyundai.com/front/pda/itemPtc.thd?slitmCd=40A1901936',
    queueBackpressure: 5,
    eventStartTime: '2025-03-15T11:50:30.143',
    eventEndTime: '2025-03-14T02:48:58.143',
    createdBy: 'SYSTEM',
    createdAt: '2025-02-27T20:14:00.418071',
    updatedBy: 'SYSTEM',
    updatedAt: '2025-03-13T11:49:48.464422',
  },
  {
    eventName: 'test2',
    eventDescription: '테스트 이벤트2',
    eventType: '타입',
    eventUrl:
      'https://www.thehyundai.com/front/pda/itemPtc.thd?slitmCd=40A1901936',
    queueBackpressure: 5,
    eventStartTime: '2025-03-13T11:50:30.143',
    eventEndTime: '2025-03-14T02:48:58.143',
    createdBy: 'SYSTEM',
    createdAt: '2025-02-27T20:14:00.418071',
    updatedBy: 'SYSTEM',
    updatedAt: '2025-03-13T11:49:48.464422',
  },
  {
    eventName: 'test3',
    eventDescription: '테스트 이벤트3',
    eventType: '타입',
    eventUrl:
      'https://www.thehyundai.com/front/pda/itemPtc.thd?slitmCd=40A1901936',
    queueBackpressure: 5,
    eventStartTime: '2025-03-13T11:50:30.143',
    eventEndTime: '2025-03-14T02:48:58.143',
    createdBy: 'SYSTEM',
    createdAt: '2025-02-27T20:14:00.418071',
    updatedBy: 'SYSTEM',
    updatedAt: '2025-03-13T11:49:48.464422',
  },
];

export const EyeIcon = (props) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 20 20"
      width="1em"
      {...props}
    >
      <path
        d="M12.9833 10C12.9833 11.65 11.65 12.9833 10 12.9833C8.35 12.9833 7.01666 11.65 7.01666 10C7.01666 8.35 8.35 7.01666 10 7.01666C11.65 7.01666 12.9833 8.35 12.9833 10Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <path
        d="M9.99999 16.8916C12.9417 16.8916 15.6833 15.1583 17.5917 12.1583C18.3417 10.9833 18.3417 9.00831 17.5917 7.83331C15.6833 4.83331 12.9417 3.09998 9.99999 3.09998C7.05833 3.09998 4.31666 4.83331 2.40833 7.83331C1.65833 9.00831 1.65833 10.9833 2.40833 12.1583C4.31666 15.1583 7.05833 16.8916 9.99999 16.8916Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
    </svg>
  );
};

export const DeleteIcon = (props) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 20 20"
      width="1em"
      {...props}
    >
      <path
        d="M17.5 4.98332C14.725 4.70832 11.9333 4.56665 9.15 4.56665C7.5 4.56665 5.85 4.64998 4.2 4.81665L2.5 4.98332"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <path
        d="M7.08331 4.14169L7.26665 3.05002C7.39998 2.25835 7.49998 1.66669 8.90831 1.66669H11.0916C12.5 1.66669 12.6083 2.29169 12.7333 3.05835L12.9166 4.14169"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <path
        d="M15.7084 7.61664L15.1667 16.0083C15.075 17.3166 15 18.3333 12.675 18.3333H7.32502C5.00002 18.3333 4.92502 17.3166 4.83335 16.0083L4.29169 7.61664"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <path
        d="M8.60834 13.75H11.3833"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <path
        d="M7.91669 10.4167H12.0834"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
    </svg>
  );
};

export const EditIcon = (props) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 20 20"
      width="1em"
      {...props}
    >
      <path
        d="M11.05 3.00002L4.20835 10.2417C3.95002 10.5167 3.70002 11.0584 3.65002 11.4334L3.34169 14.1334C3.23335 15.1084 3.93335 15.775 4.90002 15.6084L7.58335 15.15C7.95835 15.0834 8.48335 14.8084 8.74168 14.525L15.5834 7.28335C16.7667 6.03335 17.3 4.60835 15.4583 2.86668C13.625 1.14168 12.2334 1.75002 11.05 3.00002Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={1.5}
      />
      <path
        d="M9.90833 4.20831C10.2667 6.50831 12.1333 8.26665 14.45 8.49998"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={1.5}
      />
      <path
        d="M2.5 18.3333H17.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={1.5}
      />
    </svg>
  );
};

const statusColorMap = {
  active: 'success',
  paused: 'danger',
  vacation: 'warning',
};

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

export default function EventListTable({ onOpen }) {
  const renderCell = useCallback((event, columnKey) => {
    const cellValue = event[columnKey];

    switch (columnKey) {
      case 'eventName':
        return (
          <User name={event.eventDescription} description={cellValue}></User>
        );
      case 'eventUrl':
        return (
          <div className="flex flex-col">
            <p className="text-bold text-xs">{cellValue}</p>
          </div>
        );
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
        selectionBehavior="toggle"
        selectionMode="single"
        // onRowAction={(key) => alert(`Opening item ${key}...`)}

        onRowAction={(key) => onOpen(key)}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === 'actions' ? 'center' : 'start'}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={events}>
          {(item) => (
            <TableRow key={item.eventName}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
}
