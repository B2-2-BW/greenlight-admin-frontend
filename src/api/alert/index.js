import { commonAxiosInstance } from '../index.js';

const getMySubscriptions = () => commonAxiosInstance.get('/users/me/alert-subscriptions');

const updateMySubscriptions = (subscriptions) =>
  commonAxiosInstance.put('/users/me/alert-subscriptions', { subscriptions });

const getMyChannels = () => commonAxiosInstance.get('/users/me/alert-channels');

const updateMyChannels = (targets) =>
  commonAxiosInstance.put('/users/me/alert-channels', { targets });

const getAlertPolicy = (siteId) => commonAxiosInstance.get(`/sites/${siteId}/alert-policy`);

const updateAlertPolicy = (siteId, body) => commonAxiosInstance.put(`/sites/${siteId}/alert-policy`, body);

const reloadAlertPolicyCache = (siteId) => commonAxiosInstance.post(`/sites/${siteId}/alert-policy/cache`);

const reloadAllAlertPolicyCache = () => commonAxiosInstance.post('/alert-policy/cache');

const getAlertLogs = ({
  page = 1,
  size = 10,
  status,
  systemCode,
  siteId,
  from,
  to,
  signal,
} = {}) =>
  commonAxiosInstance.get('/alert-logs', {
    params: {
      page,
      size,
      platform: true,
      ...(status ? { status } : {}),
      ...(systemCode ? { systemCode } : {}),
      ...(siteId ? { siteId } : {}),
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    },
    signal,
  });

const getAlertSilences = ({ page = 1, size = 10, systemCode, status, signal } = {}) =>
  commonAxiosInstance.get('/alert-silences', {
    params: {
      page,
      size,
      ...(systemCode ? { systemCode } : {}),
      ...(status ? { status } : {}),
    },
    signal,
  });

const createAlertSilence = (body) => commonAxiosInstance.post('/alert-silences', body);

const updateAlertSilence = (silenceId, body) => commonAxiosInstance.put(`/alert-silences/${silenceId}`, body);

const cancelAlertSilence = (silenceId) => commonAxiosInstance.post(`/alert-silences/${silenceId}/cancel`);

export const AlertClient = {
  getMySubscriptions,
  updateMySubscriptions,
  getMyChannels,
  updateMyChannels,
  getAlertPolicy,
  updateAlertPolicy,
  reloadAlertPolicyCache,
  reloadAllAlertPolicyCache,
  getAlertLogs,
  getAlertSilences,
  createAlertSilence,
  updateAlertSilence,
  cancelAlertSilence,
};
