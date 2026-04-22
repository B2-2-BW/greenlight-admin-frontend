// 유저 생성
import { commonAxiosInstance, publicAxiosInstance } from '../index.js';

const createUser = async (body) => {
  const { data } = await commonAxiosInstance.put(`/users`, body, {});
  return data;
};

const me = async () => {
  return await commonAxiosInstance.get(`/users/me`, {}).then(
    (response) => response,
    (error) => {
      console.error(error);
      return error.response;
    }
  );
};

const login = async (body) => {
  return await publicAxiosInstance.post(`/users/login`, body, {}).then(
    (response) => response,
    (error) => {
      console.error(error);
      return error.response;
    }
  );
};

const issueAccessToken = (params) => {
  return publicAxiosInstance.post('/users/refresh', {}, { params, withCredentials: true });
};

const logout = () => {
  return commonAxiosInstance.post('/users/logout', {}, { withCredentials: true });
};

const UserClient = {
  me,
  login,
  logout,
  issueAccessToken,
};
export { UserClient };
