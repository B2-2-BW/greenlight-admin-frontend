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

export const AlertClient = {
  getMySubscriptions,
  updateMySubscriptions,
  getMyChannels,
  updateMyChannels,
  getAlertPolicy,
  updateAlertPolicy,
  reloadAlertPolicyCache,
  reloadAllAlertPolicyCache,
};
