import { commonAxiosInstance } from '../index.js';
import qs from 'qs';

const getDashboardDetail = async (params) => {
  return commonAxiosInstance.get(`/dashboard`, {
    params,
    paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
  });
};

const DashboardClient = {
  getDashboardDetail,
};

export { DashboardClient };
