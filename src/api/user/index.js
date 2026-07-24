// 유저 생성
import { commonAxiosInstance, publicAxiosInstance } from '../index.js';

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

const changeMyPassword = async (body) => {
  return await commonAxiosInstance.put(`/users/me/password`, body, {}).then(
    (response) => response,
    (error) => {
      console.error(error);
      return error.response;
    }
  );
};

const updateMyProfile = (body) => commonAxiosInstance.put('/users/me', body);

const signin = async (body) => {
  return await publicAxiosInstance.post(`/users/signin`, body, {}).then(
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

const getUsers = ({ page = 1, size = 10, query = '', signal } = {}) =>
  commonAxiosInstance.get('/users', {
    params: { page, size, ...(query.trim() ? { query: query.trim() } : {}) },
    signal,
  });

const getUser = (userId) => commonAxiosInstance.get(`/users/${userId}`);

const updateUserStatus = (userId, accountStatus) =>
  commonAxiosInstance.put(`/users/${userId}/status`, { accountStatus });

const approveUser = (userId, body) => commonAxiosInstance.put(`/users/${userId}/approval`, body);

const updateManagedUser = (userId, body) => commonAxiosInstance.put(`/users/${userId}`, body);

const resetUserPassword = (userId, body) =>
  commonAxiosInstance.post(`/users/${userId}/password/reset`, body);

const UserClient = {
  me,
  updateMyProfile,
  changeMyPassword,
  login,
  signin,
  logout,
  issueAccessToken,
  getUsers,
  getUser,
  updateUserStatus,
  approveUser,
  updateManagedUser,
  resetUserPassword,
};
export { UserClient };
