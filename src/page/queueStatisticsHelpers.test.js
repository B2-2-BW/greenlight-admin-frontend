import assert from 'node:assert/strict';
import test from 'node:test';
import { buildQueueStatisticsCsv } from './queueStatisticsExport.js';

test('csv contains a UTF-8 BOM and only summary sections', () => {
  const csv = buildQueueStatisticsCsv({
    currentRange: { from: 'current-from', to: 'current-to' },
    summary: { maxWaiting: 12, waitingCount: 20, enteredCount: 15, cancelledCount: 2 },
    rooms: [],
  });

  assert.equal(csv.charCodeAt(0), 0xfeff);
  assert.match(csv, /전체 요약/);
  assert.match(csv, /Room별 요약/);
  assert.doesNotMatch(csv, /timestamp/);
});

test('csv neutralizes formula-like room strings without converting numeric metrics', () => {
  const csv = buildQueueStatisticsCsv({
    currentRange: { from: 'current-from', to: 'current-to' },
    summary: { maxWaiting: 1, waitingCount: 1, enteredCount: 1, cancelledCount: 1 },
    rooms: [{
      roomId: '=malicious-id',
      name: '@SUM(A1:A2)',
      maxWaiting: 1,
      maxActive: 2,
      waitingCount: -1,
      enteredCount: 3,
      exitedCount: 4,
      cancelledCount: 5,
    }],
  });

  assert.match(csv, /'=malicious-id,'@SUM\(A1:A2\)/);
  assert.match(csv, /,1,2,-1,3,4,5/);
  assert.doesNotMatch(csv, /,'-1/);
});
