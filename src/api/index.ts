import axios from 'axios';

export const commonAxiosInstance = axios.create({
  // baseURL: b22w baseurl,
  headers: {
    'Content-Type': 'application/json',
  },
});