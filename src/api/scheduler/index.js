import { commonAxiosInstance } from '../index.js';

const getSchedulerStatusList = async () => {
  const { data } = await commonAxiosInstance.get('/system-status');
  return data;
};

const SchedulerClient = {
  getSchedulerStatusList,
};

export { SchedulerClient };
