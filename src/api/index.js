import axios from 'axios';
import { BASE_CORE_URL, BASE_EXTERNAL_URL } from '../client/config';

export const commonAxiosInstance = axios.create({
  baseURL: BASE_EXTERNAL_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const coreAxiosInstance = axios.create({
  baseURL: BASE_CORE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
