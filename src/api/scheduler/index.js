import { schedulerAxiosInstance } from '../index.js';
import { invalidateCoreActionGroupCache } from '../action-group/index.js';

const getSchedulerStatusList = async () => {
  const { data } = await schedulerAxiosInstance.get(`/schedulers/status`);
  return data;
};

const startScheduler = async (schedulerType) => {
  const { data } = await schedulerAxiosInstance.post(`/schedulers/${schedulerType}/start`);
  return data;
};

const stopScheduler = async (schedulerType) => {
  const { data } = await schedulerAxiosInstance.post(`/schedulers/${schedulerType}/stop`);
  return data;
};

const SchedulerClient = {
  getSchedulerStatusList,
  startScheduler,
  stopScheduler,
};

export { SchedulerClient };
