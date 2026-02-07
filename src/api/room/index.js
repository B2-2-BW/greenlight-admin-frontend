import { commonAxiosInstance } from '../index.js';

// 단일 액션그룹 정보 조회
const getRoomById = async (roomId) => {
  const { data } = await commonAxiosInstance.get(`/rooms/${roomId}`);
  return data;
};

// 액션그룹 리스트 정보 조회
const getRoomList = async (query) => {
  const { data } = await commonAxiosInstance.get(`/rooms`, { params: query });
  return data;
};
const createRoom = async (data) => {
  return commonAxiosInstance.post(`/rooms`, data);
};

const updateRoomById = async (roomId, data) => {
  return commonAxiosInstance.put(`/rooms/${roomId}`, data);
};

const deleteRoomById = async (roomId) => {
  return commonAxiosInstance.delete(`/rooms/${roomId}`);
};

const RoomClient = {
  getRoomById,
  getRoomList,
  createRoom,
  updateRoomById,
  deleteRoomById,
};

export { RoomClient };
