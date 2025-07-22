import { commonAxiosInstance, coreAxiosInstance } from '../index.js';

// 단일 액션그룹 정보 조회
export const getActionById = async (actionId) => {
  return commonAxiosInstance.get(`/actions/${actionId}`);
};
