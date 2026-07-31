import { KPI_METRICS, ROOM_SUMMARY_METRICS } from './queueStatisticsHelpers.js';

const escapeCsvCell = (value) => {
  const safeValue = typeof value === 'string' && /^[=+\-@\t\r\n]/.test(value) ? `'${value}` : value;
  const text = String(safeValue ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

const csvRow = (values) => values.map(escapeCsvCell).join(',');
const boldCell = (value) => ({ value, fontWeight: 'bold' });
const valueCell = (value) => ({
  value,
  type: typeof value === 'number' ? Number : String,
});

const formatFileTimestamp = (timestamp) => timestamp.replaceAll(/[-:]/g, '').slice(0, 13);

export const buildQueueStatisticsCsv = ({
  currentRange,
  summary,
  rooms,
}) => {
  const rows = [
    csvRow(['대기열 통계']),
    csvRow(['현재 기간', currentRange.from, currentRange.to]),
  ];
  rows.push('', csvRow(['전체 요약']));
  rows.push(csvRow(['지표', '현재']));
  KPI_METRICS.forEach(({ key, label }) => {
    rows.push(csvRow([label, summary[key]]));
  });

  rows.push('', csvRow(['Room별 요약']));
  const roomHeader = ['Room ID', 'Room'];
  ROOM_SUMMARY_METRICS.forEach(({ label }) => {
    roomHeader.push(label);
  });
  rows.push(csvRow(roomHeader));
  rooms.forEach((room) => {
    const values = [room.roomId, room.name];
    ROOM_SUMMARY_METRICS.forEach(({ key }) => {
      values.push(room[key]);
    });
    rows.push(csvRow(values));
  });
  return `\uFEFF${rows.join('\r\n')}`;
};

export const downloadQueueStatisticsCsv = (report) => {
  const csv = buildQueueStatisticsCsv(report);
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `queue-statistics-${formatFileTimestamp(report.currentRange.to)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const downloadQueueStatisticsXlsx = async (report) => {
  const { default: writeXlsxFile } = await import('write-excel-file/browser');
  const summaryRows = [
    [boldCell('대기열 통계')],
    [boldCell('현재 기간'), valueCell(report.currentRange.from), valueCell(report.currentRange.to)],
  ];
  summaryRows.push([]);
  summaryRows.push(['지표', '현재'].map(boldCell));
  KPI_METRICS.forEach(({ key, label }) => {
    const row = [valueCell(label), valueCell(report.summary[key])];
    summaryRows.push(row);
  });

  const roomHeader = ['Room ID', 'Room'];
  ROOM_SUMMARY_METRICS.forEach(({ label }) => {
    roomHeader.push(label);
  });
  const roomRows = [roomHeader.map(boldCell)];
  report.rooms.forEach((room) => {
    const row = [valueCell(room.roomId), valueCell(room.name)];
    ROOM_SUMMARY_METRICS.forEach(({ key }) => {
      row.push(valueCell(room[key]));
    });
    roomRows.push(row);
  });

  await writeXlsxFile([summaryRows, roomRows], {
    sheets: ['요약', 'Room별 요약'],
    fileName: `queue-statistics-${formatFileTimestamp(report.currentRange.to)}.xlsx`,
  });
};
