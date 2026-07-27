import qs from 'qs';
import { commonAxiosInstance } from '../index.js';

const getQueueStatistics = async ({ signal, ...params }) => commonAxiosInstance.get('/queue-statistics', {
  params,
  signal,
  paramsSerializer: (query) => qs.stringify(query, { arrayFormat: 'repeat' }),
});

export const QueueStatisticsClient = { getQueueStatistics };
