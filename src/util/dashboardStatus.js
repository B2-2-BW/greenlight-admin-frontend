export function getWaitingQueueStatus(waitTime) {
  if (!Number.isFinite(waitTime)) return '-';
  if (waitTime < 0) return '진입불가';
  if (waitTime >= 600) return '폭주';
  if (waitTime >= 10) return '혼잡';
  if (waitTime > 0) return '원활';
  return '바로입장';
}
