import { commonAxiosInstance } from '../index.js';

const getAuditLogs = ({
  page = 1,
  size = 20,
  siteId,
  createdBy,
  targetType,
  targetId,
  action,
  from,
  to,
  signal,
} = {}) =>
  commonAxiosInstance.get('/audit-logs', {
    params: {
      page,
      size,
      ...(siteId?.trim() ? { siteId: siteId.trim() } : {}),
      ...(createdBy?.trim() ? { createdBy: createdBy.trim() } : {}),
      ...(targetType?.trim() ? { targetType: targetType.trim() } : {}),
      ...(targetId?.trim() ? { targetId: targetId.trim() } : {}),
      ...(action?.trim() ? { action: action.trim() } : {}),
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    },
    signal,
  });

export const AuditClient = { getAuditLogs };
