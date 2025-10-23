import axios from 'axios';
import { BASE_CORE_URL, BASE_EXTERNAL_URL, BASE_SCHEDULER_URL } from '../client/config';
import { LoginUtil } from '../util/loginUtil.js';

const loginAxiosInstance = axios.create({
  baseURL: BASE_EXTERNAL_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const commonAxiosInstance = axios.create({
  baseURL: BASE_EXTERNAL_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const schedulerAxiosInstance = axios.create({
  baseURL: BASE_SCHEDULER_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

commonAxiosInstance.interceptors.request.use(
  (config) => {
    const token = LoginUtil.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const coreAxiosInstance = axios.create({
  baseURL: BASE_CORE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export { commonAxiosInstance, coreAxiosInstance, loginAxiosInstance, schedulerAxiosInstance };
