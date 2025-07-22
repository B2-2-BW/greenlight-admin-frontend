import { commonAxiosInstance, coreAxiosInstance } from '../index.js';

// 단일 액션그룹 정보 조회
export const getActionGroupById = async (actionGroupId) => {
  const { data } = await commonAxiosInstance.get(`/action-groups/${actionGroupId}`);
  return data;
};

// 액션그룹 리스트 정보 조회
export const getActionGroupList = async () => {
  const { data } = await commonAxiosInstance.get(`/action-groups`);
  return data;
};

// 이벤트 정보 업데이트
export const updateEventByEventName = async (eventName, body) => {
  const { data } = await commonAxiosInstance.put(`/events/${eventName}`, body, {});
  return data;
};

// 이벤트 삭제
export const deleteEventByEventName = async (eventName) => {
  const { data } = await commonAxiosInstance.delete(`/events/${eventName}`);
  return data;
};

// 이벤트 생성
export const createEvent = async (body) => {
  const { data } = await commonAxiosInstance.post(`/events`, body, {});
  return data;
};

// 캐시 초기화
export const requestEventsCacheReload = async () => {
  const { data } = await commonAxiosInstance.put(`/events/cache/reload`);
  return data;
};

// 캐시 초기화
export const invalidateCoreEventCache = async (eventName) => {
  const { data } = await coreAxiosInstance.delete(`/events/${eventName}/cache`);
  return data;
};
