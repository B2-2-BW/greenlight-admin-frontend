// 유저 생성
import { commonAxiosInstance, loginAxiosInstance } from '../index.js';

export const createUser = async (body) => {
  const { data } = await commonAxiosInstance().put(`/users`, body, {});
  return data;
};

export const login = async (body) => {
  return await loginAxiosInstance.post(`/users/login`, body, {}).then(
    (response) => response,
    (error) => {
      console.error(error);
      return error.response;
    }
  );
};
