import axios from 'axios';
import { LoginUtil } from '../util/loginUtil.js';
import { useUserStore } from '../store/user.jsx';

const publicAxiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

const commonAxiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

commonAxiosInstance.interceptors.request.use(
  (config) => {
    const token = LoginUtil.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

commonAxiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 403
      && error.response?.data?.message === 'Password reset required.'
    ) {
      const currentUser = useUserStore.getState().user ?? {};
      useUserStore.getState().setUser({ ...currentUser, passwordResetRequired: true });
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await LoginUtil.issueAndSetAccessToken();
        return commonAxiosInstance(originalRequest);
      } catch (err) {
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export { commonAxiosInstance, publicAxiosInstance };
