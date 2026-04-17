import { commonAxiosInstance } from '../index.js';

const getSchedulerStatusList = async () => {
  const { data } = await commonAxiosInstance.get(`/schedulers/status`);
  return data;
};

const startScheduler = async (schedulerType) => {
  const { data } = await commonAxiosInstance.post(`/schedulers/${schedulerType}/start`);
  return data;
};

const stopScheduler = async (schedulerType) => {
  const { data } = await commonAxiosInstance.post(`/schedulers/${schedulerType}/stop`);
  return data;
};

const SchedulerClient = {
  getSchedulerStatusList,
  startScheduler,
  stopScheduler,
};

export { SchedulerClient };
