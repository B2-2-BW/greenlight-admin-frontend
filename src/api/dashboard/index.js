import { commonAxiosInstance } from '../index.js';

// 단일 액션그룹 정보 조회
const getDashboardDetail = async (param) => {
  const { data } = await commonAxiosInstance.get(`/dashboard?window=${param.window}&mock=${param.mock}`);
  return data;
};

const DashboardClient = {
  getDashboardDetail,
};

export { DashboardClient };
