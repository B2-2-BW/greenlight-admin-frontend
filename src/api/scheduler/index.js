import { commonAxiosInstance } from '../index.js';

const getSchedulerStatusList = async ({ rotateRefresh } = {}) => {
  const { data } = await commonAxiosInstance.get('/system-status', { rotateRefresh });
  return data;
};

const SchedulerClient = {
  getSchedulerStatusList,
};

export { SchedulerClient };
