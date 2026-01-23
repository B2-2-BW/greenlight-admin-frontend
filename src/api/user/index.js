// 유저 생성
import { commonAxiosInstance, loginAxiosInstance } from '../index.js';

const createUser = async (body) => {
  const { data } = await commonAxiosInstance().put(`/users`, body, {});
  return data;
};

const me = async () => {
  const { data } = await commonAxiosInstance.get('/users/me');
  return data;
};

const login = async (body) => {
  return await loginAxiosInstance.post(`/users/login`, body, {}).then(
    (response) => response,
    (error) => {
      console.error(error);
      return error.response;
    }
  );
};

const UserClient = {
  me,
  login,
};
export { UserClient };
