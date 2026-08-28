import { KPI_METRICS, ROOM_SUMMARY_METRICS, summarizeRoomTotals } from './queueStatisticsHelpers.js';

const DETAIL_METRICS = [
  { key: 'totalWaiting', label: '대기 인원' },
  { key: 'totalActive', label: '활성 인원' },
  { key: 'waitingCount', label: '전체 유입' },
  { key: 'enteredCount', label: '입장' },
  { key: 'exitedCount', label: '이탈' },
  { key: 'cancelledCount', label: '취소' },
];

const TOTAL_FILL = '#D8EEE1';

const boldCell = (value) => ({ value, fontWeight: 'bold' });
const valueCell = (value) => ({
  value,
  type: typeof value === 'number' ? Number : String,
});
const totalCell = (value) => ({
  ...valueCell(value),
  fontWeight: 'bold',
  backgroundColor: TOTAL_FILL,
});

const formatFileTimestamp = (timestamp) => timestamp.replaceAll(/[-:]/g, '').slice(0, 13);

const formatExportTimestamp = (timestamp) =>
  new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
    .format(new Date(timestamp))
    .replace('T', ' ');

const safeString = (value) => {
  const text = String(value ?? '');
  return /^[=+\-@\t\r\n]/.test(text) ? `'${text}` : text;
};

export const sanitizeSheetName = (name, usedNames = new Set()) => {
  let base = safeString(name)
    .replaceAll(/[:\\/?*[\]]/g, '_')
    .slice(0, 31)
    .trim();
  if (!base) base = 'Room';
  let candidate = base;
  let index = 2;
  while (usedNames.has(candidate.toLowerCase())) {
    const suffix = `-${index}`;
    candidate = `${base.slice(0, Math.max(1, 31 - suffix.length))}${suffix}`;
    index += 1;
  }
  usedNames.add(candidate.toLowerCase());
  return candidate;
};

const buildRoomSummaryRows = (rooms, peaks) => {
  const header = ['Room ID', 'Room'];
  ROOM_SUMMARY_METRICS.forEach(({ label }) => header.push(label));
  const rows = [header.map(boldCell)];
  rooms.forEach((room) => {
    const row = [valueCell(safeString(room.roomId)), valueCell(safeString(room.name))];
    ROOM_SUMMARY_METRICS.forEach(({ key }) => {
      row.push(valueCell(room[key] ?? 0));
    });
    rows.push(row);
  });
  if (rooms.length === 0) return rows;
  const total = summarizeRoomTotals(rooms, peaks);
  const totalRow = [totalCell(''), totalCell('합계')];
  ROOM_SUMMARY_METRICS.forEach(({ key }) => {
    totalRow.push(totalCell(total[key] ?? 0));
  });
  rows.push(totalRow);
  return rows;
};

const buildSummarySheet = (report) => {
  const rows = [
    [boldCell('대기열 통계')],
    [boldCell('기간'), valueCell(report.currentRange.from), valueCell(report.currentRange.to)],
    [boldCell('시간 단위'), valueCell(report.windowLabel)],
    [],
    ['지표', '값'].map(boldCell),
  ];
  KPI_METRICS.forEach(({ key, label }) => {
    rows.push([valueCell(label), valueCell(report.summary[key] ?? 0)]);
  });
  rows.push([]);
  rows.push([boldCell('대기열 요약')]);
  rows.push(...buildRoomSummaryRows(report.rooms ?? [], report.summary));
  return rows;
};

const buildRoomDetailSheet = (room) => {
  const header = ['시간'];
  DETAIL_METRICS.forEach(({ label }) => header.push(label));
  const rows = [header.map(boldCell)];
  (room.points ?? []).forEach((point) => {
    const row = [valueCell(formatExportTimestamp(point.timestamp))];
    DETAIL_METRICS.forEach(({ key }) => {
      row.push(valueCell(Number(point[key] ?? 0)));
    });
    rows.push(row);
  });
  return rows;
};

export const buildQueueStatisticsWorkbook = (report) => {
  const usedNames = new Set();
  const sheets = [{ sheet: sanitizeSheetName('요약', usedNames), data: buildSummarySheet(report) }];
  (report.series ?? []).forEach((room) => {
    sheets.push({
      sheet: sanitizeSheetName(room.name || room.roomId, usedNames),
      data: buildRoomDetailSheet(room),
    });
  });
  return sheets;
};

export const downloadQueueStatisticsXlsx = async (report) => {
  const { default: writeXlsxFile } = await import('write-excel-file/browser');
  const sheets = buildQueueStatisticsWorkbook(report);
  await writeXlsxFile(sheets).toFile(`queue-statistics-${formatFileTimestamp(report.currentRange.to)}.xlsx`);
};
