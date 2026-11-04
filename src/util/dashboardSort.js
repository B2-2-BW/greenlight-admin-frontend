export const DASHBOARD_SORT_OPTIONS = [
  { key: 'name', label: '이름순' },
  { key: 'latest', label: '최신순' },
  { key: 'custom', label: '사용자 지정' },
];

export const DEFAULT_DASHBOARD_SORT = { mode: 'custom', roomIds: [] };

const nameCollator = new Intl.Collator('ko', { numeric: true, sensitivity: 'base' });

export function getDashboardSortKey(userId, siteId, environment) {
  return JSON.stringify([userId ?? '', siteId ?? '', environment ?? 'LIVE']);
}

export function normalizeDashboardSort(preference) {
  return {
    mode: DASHBOARD_SORT_OPTIONS.some(({ key }) => key === preference?.mode) ? preference.mode : 'custom',
    roomIds: Array.isArray(preference?.roomIds)
      ? [...new Set(preference.roomIds.filter((id) => typeof id === 'string'))]
      : [],
  };
}

export function sortDashboardRooms(rooms, preference) {
  const { mode, roomIds } = normalizeDashboardSort(preference);
  const result = [...rooms];
  const compareId = (first, second) => (first.roomId < second.roomId ? -1 : first.roomId > second.roomId ? 1 : 0);

  if (mode === 'latest') {
    return result.sort((first, second) => compareId(second, first));
  }
  if (mode === 'name') {
    return result.sort(
      (first, second) => nameCollator.compare(first.name ?? '', second.name ?? '') || compareId(first, second)
    );
  }
  const positions = new Map(roomIds.map((id, index) => [id, index]));
  return result.sort(
    (first, second) => (positions.get(first.roomId) ?? Infinity) - (positions.get(second.roomId) ?? Infinity)
  );
}

export function reorderDashboardRooms(savedIds, visibleIds, fromIndex, toIndex) {
  if (fromIndex < 0 || toIndex < 0 || fromIndex >= visibleIds.length || toIndex >= visibleIds.length) {
    return [...savedIds];
  }
  const reordered = [...visibleIds];
  const [movedId] = reordered.splice(fromIndex, 1);
  reordered.splice(toIndex, 0, movedId);

  // Replace only visible slots so filtering does not discard the hidden rooms' order.
  const visible = new Set(visibleIds);
  let index = 0;
  return [...new Set([...savedIds, ...visibleIds])].map((id) => (visible.has(id) ? reordered[index++] : id));
}
