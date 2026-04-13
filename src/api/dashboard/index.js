import { commonAxiosInstance } from '../index.js';
import qs from 'qs';

// 단일 액션그룹 정보 조회
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
