import assert from 'node:assert/strict';
import test from 'node:test';
import { buildQueueStatisticsWorkbook, sanitizeSheetName } from './queueStatisticsExport.js';
import { summarizeRoomTotals, withConcurrentPeaks } from './queueStatisticsHelpers.js';

test('workbook includes one summary sheet and one sheet per room', () => {
  const workbook = buildQueueStatisticsWorkbook({
    currentRange: { from: '2026-08-01T00:00:00.000Z', to: '2026-08-02T00:00:00.000Z' },
    windowLabel: '1분',
    summary: { waitingCount: 20, maxWaiting: 12, maxActive: 8, enteredCount: 15, cancelledCount: 2 },
    rooms: [
      {
        roomId: 'room-a',
        name: 'A',
        maxWaiting: 12,
        maxActive: 8,
        waitingCount: 20,
        enteredCount: 15,
        exitedCount: 3,
        cancelledCount: 2,
      },
    ],
    series: [
      {
        roomId: 'room-a',
        name: 'A',
        points: [
          {
            timestamp: '2026-08-01T00:00:00.000Z',
            totalWaiting: 4,
            totalActive: 2,
            waitingCount: 1,
            enteredCount: 1,
            exitedCount: 0,
            cancelledCount: 0,
          },
        ],
      },
    ],
  });

  assert.equal(workbook.length, 2);
  assert.equal(workbook[0].sheet, '요약');
  assert.equal(workbook[1].sheet, 'A');
  assert.equal(workbook[1].data[0][0].value, '시간');
  assert.equal(workbook[1].data[1][1].value, 4);

  const summaryValues = workbook[0].data.flat().map((cell) => cell?.value);
  assert.equal(summaryValues.includes('지표'), true);
  assert.equal(summaryValues.includes('대기열 요약'), true);

  const totalRow = workbook[0].data.find((row) => row[1]?.value === '합계');
  assert.equal(totalRow[0].value, '');
  assert.equal(totalRow[1].value, '합계');
  assert.equal(totalRow[2].value, 12);
  assert.equal(totalRow[3].value, 8);
  assert.equal(totalRow[4].value, 20);
  assert.equal(totalRow[2].fontWeight, 'bold');
  assert.equal(totalRow[2].backgroundColor, '#D8EEE1');
});

test('sheet names are sanitized and unique', () => {
  const used = new Set();
  assert.equal(sanitizeSheetName('a:b/c', used), 'a_b_c');
  assert.equal(sanitizeSheetName('a:b/c', used), 'a_b_c-2');
  assert.equal(sanitizeSheetName('=cmd', used), "'=cmd");
});

test('room sheets fall back to room id when name is missing', () => {
  const workbook = buildQueueStatisticsWorkbook({
    currentRange: { from: '2026-08-01T00:00:00.000Z', to: '2026-08-02T00:00:00.000Z' },
    windowLabel: '1분',
    summary: {},
    rooms: [],
    series: [{ roomId: 'room-a', points: [] }],
  });

  assert.equal(workbook[1].sheet, 'room-a');
});

test('withConcurrentPeaks prefers API concurrent maxes', () => {
  const merged = withConcurrentPeaks(
    { maxWaiting: 16, maxActive: 9, waitingCount: 20 },
    { maxWaiting: 13, maxActive: 9 }
  );
  assert.equal(merged.maxWaiting, 13);
  assert.equal(merged.maxActive, 9);
  assert.equal(merged.waitingCount, 20);
});

test('room totals use concurrent peaks instead of summed room maxes', () => {
  const total = summarizeRoomTotals(
    [
      { maxWaiting: 12, maxActive: 8, waitingCount: 20, enteredCount: 15, exitedCount: 3, cancelledCount: 2 },
      { maxWaiting: 4, maxActive: 1, waitingCount: 5, enteredCount: 4, exitedCount: 1, cancelledCount: 0 },
    ],
    { maxWaiting: 13, maxActive: 9 }
  );
  assert.equal(total.name, '합계');
  assert.equal(total.waitingCount, 25);
  assert.equal(total.maxWaiting, 13);
  assert.equal(total.maxActive, 9);
  assert.equal(total.enteredCount, 19);
});

test('workbook total row uses concurrent peaks from summary', () => {
  const workbook = buildQueueStatisticsWorkbook({
    currentRange: { from: '2026-08-01T00:00:00.000Z', to: '2026-08-02T00:00:00.000Z' },
    windowLabel: '1분',
    summary: { waitingCount: 25, maxWaiting: 13, maxActive: 9, enteredCount: 19, cancelledCount: 2 },
    rooms: [
      { roomId: 'room-a', name: 'A', maxWaiting: 12, maxActive: 8, waitingCount: 20, enteredCount: 15, exitedCount: 3, cancelledCount: 2 },
      { roomId: 'room-b', name: 'B', maxWaiting: 4, maxActive: 1, waitingCount: 5, enteredCount: 4, exitedCount: 1, cancelledCount: 0 },
    ],
    series: [],
  });
  const totalRow = workbook[0].data.find((row) => row[1]?.value === '합계');
  assert.equal(totalRow[2].value, 13);
  assert.equal(totalRow[3].value, 9);
  assert.equal(totalRow[4].value, 25);
});
