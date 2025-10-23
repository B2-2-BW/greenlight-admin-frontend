import { commonAxiosInstance, coreAxiosInstance } from '../index.js';

// 단일 액션그룹 정보 조회
const getActionById = async (actionId) => {
  return commonAxiosInstance.get(`/actions/${actionId}`);
};

const updateActionById = async (actionId, data) => {
  return commonAxiosInstance.put(`/actions/${actionId}`, data);
};

const invalidateCoreActionCache = async (actionId) => {
  return coreAxiosInstance.delete(`/actions/${actionId}/cache`);
};

const deleteActionById = async (actionId) => {
  return commonAxiosInstance.delete(`/actions/${actionId}`);
};

const ActionClient = {
  getActionById,
  updateActionById,
  invalidateCoreActionCache,
  deleteActionById,
};
export { ActionClient };
