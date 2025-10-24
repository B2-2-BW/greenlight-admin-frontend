import { commonAxiosInstance, coreAxiosInstance } from '../index.js';

// 단일 액션그룹 정보 조회
const getActionGroupById = async (actionGroupId) => {
  const { data } = await commonAxiosInstance.get(`/action-groups/${actionGroupId}`);
  return data;
};

// 액션그룹 리스트 정보 조회
const getActionGroupList = async (query) => {
  const { data } = await commonAxiosInstance.get(`/action-groups`, { params: query });
  return data;
};

const createAction = async (actionGroupId, data) => {
  return commonAxiosInstance.post(`/action-groups/${actionGroupId}/actions`, data);
};

const createActionGroup = async (data) => {
  return commonAxiosInstance.post(`/action-groups`, data);
};

const updateActionGroupById = async (actionGroupId, data) => {
  return commonAxiosInstance.put(`/action-groups/${actionGroupId}`, data);
};

const deleteActionGroupById = async (actionGroupId) => {
  return commonAxiosInstance.delete(`/action-groups/${actionGroupId}`);
};

const ActionGroupClient = {
  getActionGroupById,
  getActionGroupList,
  createAction,
  createActionGroup,
  updateActionGroupById,
  deleteActionGroupById,
};

export { ActionGroupClient };
