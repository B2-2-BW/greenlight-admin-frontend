import axios from 'axios';
import { BASE_API_URL } from '../client/config';
import { TokenUtil } from '../util/tokenUtil.js';

const publicAxiosInstance = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const commonAxiosInstance = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const schedulerAxiosInstance = axios.create({
  // baseURL: BASE_SCHEDULER_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

commonAxiosInstance.interceptors.request.use(
  (config) => {
    const token = TokenUtil.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export { commonAxiosInstance, publicAxiosInstance, schedulerAxiosInstance };
