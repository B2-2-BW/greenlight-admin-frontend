import { commonAxiosInstance } from '../index.js';

// 단일 액션그룹 정보 조회
const getRoomById = async (roomId) => {
  const { data } = await commonAxiosInstance.get(`/rooms/${roomId}`);
  return data;
};

// 액션그룹 리스트 정보 조회
const getRoomList = async (query) => {
  return commonAxiosInstance.get(`/rooms`, { params: query });
};

const getRoomPage = async ({ signal, ...params }) => {
  return commonAxiosInstance.get('/rooms/page', { params, signal });
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

const syncRoomData = async () => {
  return commonAxiosInstance.post('/rooms/cache');
};

const RoomClient = {
  getRoomById,
  getRoomList,
  getRoomPage,
  createRoom,
  updateRoomById,
  deleteRoomById,
  syncRoomData,
};

export { RoomClient };
