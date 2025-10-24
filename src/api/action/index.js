import { commonAxiosInstance, coreAxiosInstance } from '../index.js';

// 단일 액션그룹 정보 조회
const getActionById = async (actionId) => {
  return commonAxiosInstance.get(`/actions/${actionId}`);
};

const updateActionById = async (actionId, data) => {
  return commonAxiosInstance.put(`/actions/${actionId}`, data);
};

const deleteActionById = async (actionId) => {
  return commonAxiosInstance.delete(`/actions/${actionId}`);
};

const ActionClient = {
  getActionById,
  updateActionById,
  deleteActionById,
};
export { ActionClient };
