const metricKeys = ['totalWaiting', 'totalActive', 'waitingCount', 'enteredCount', 'exitedCount', 'cancelledCount'];

const asNumber = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);

export const buildQueueWindows = (series = []) => {
  const byTimestamp = new Map();

  series.forEach((room) => {
    (room.points ?? []).forEach((point) => {
      if (!point.timestamp) return;
      const current = byTimestamp.get(point.timestamp) ?? {
        timestamp: point.timestamp,
        totalWaiting: 0,
        totalActive: 0,
        waitingCount: 0,
        enteredCount: 0,
        exitedCount: 0,
        cancelledCount: 0,
        estimatedWaitTime: null,
      };
      metricKeys.forEach((key) => { current[key] += asNumber(point[key]); });
      const estimatedWaitTime = Number(point.estimatedWaitTime);
      if (Number.isFinite(estimatedWaitTime) && estimatedWaitTime >= 0) {
        current.estimatedWaitTime = Math.max(current.estimatedWaitTime ?? estimatedWaitTime, estimatedWaitTime);
      }
      byTimestamp.set(point.timestamp, current);
    });
  });

  return [...byTimestamp.values()].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
};

export const summarizeQueueStatistics = (series = []) => {
  const windows = buildQueueWindows(series);
  return {
    maxWaiting: Math.max(0, ...windows.map((window) => window.totalWaiting)),
    waitingCount: windows.reduce((sum, window) => sum + window.waitingCount, 0),
    enteredCount: windows.reduce((sum, window) => sum + window.enteredCount, 0),
    cancelledCount: windows.reduce((sum, window) => sum + window.cancelledCount, 0),
  };
};

export const summarizeRooms = (series = []) => series.map((room) => {
  const points = room.points ?? [];
  const sum = (key) => points.reduce((total, point) => total + asNumber(point[key]), 0);
  const max = (key) => Math.max(0, ...points.map((point) => asNumber(point[key])));
  return {
    roomId: room.roomId,
    name: room.name ?? room.roomId,
    maxWaiting: max('totalWaiting'),
    maxActive: max('totalActive'),
    waitingCount: sum('waitingCount'),
    enteredCount: sum('enteredCount'),
    exitedCount: sum('exitedCount'),
    cancelledCount: sum('cancelledCount'),
  };
});
