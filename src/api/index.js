import axios from 'axios';
import { LoginUtil } from '../util/loginUtil.js';
import { useUserStore } from '../store/user.jsx';
import { getEffectiveSiteId } from '../util/siteUtil.js';

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
      const { user, selectedSiteId } = useUserStore.getState();
      const siteId = getEffectiveSiteId(user, selectedSiteId);
      if (siteId) {
        config.headers['X-ADMIN-SITE-ID'] = siteId;
      } else {
        delete config.headers['X-ADMIN-SITE-ID'];
      }
    }
    if (typeof window !== 'undefined' && window.location.pathname) {
      config.headers['X-Admin-Source-Path'] = window.location.pathname;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

commonAxiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 초기화 필요 계정은 세션을 유지하지 않는다. 토큰/유저 상태를 비우고 로그인으로 보낸다.
    if (
      error.response?.status === 403
      && error.response?.data?.message === 'Password reset required.'
    ) {
      LoginUtil.clearAccessToken();
      useUserStore.getState().clearUser();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await LoginUtil.issueAndSetAccessToken();
        return commonAxiosInstance(originalRequest);
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          LoginUtil.clearAccessToken();
          useUserStore.getState().clearUser();
          window.location.href = '/login';
        }
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export { commonAxiosInstance, publicAxiosInstance };
