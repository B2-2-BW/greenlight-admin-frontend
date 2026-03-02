import { commonAxiosInstance } from '../index.js';

// 단일 액션그룹 정보 조회
const getDashboardDetail = async (param) => {
  return commonAxiosInstance.get(`/dashboard?version=${param.version}`);
};

const DashboardClient = {
  getDashboardDetail,
};

export { DashboardClient };
