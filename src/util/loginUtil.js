import { jwtDecode } from 'jwt-decode';
import { UserClient } from '../api/user/index.js';
import { usePreferenceStore } from '../store/preference.jsx';

let _accessToken = null;

/**
 * JWT 토큰의 만료 및 비정상 여부를 검사합니다.
 * @param {string} token - 검사할 JWT 토큰
 * @returns {{ valid: boolean, expired: boolean, message: string }} 결과 객체
 */
function validateJwt(token) {
  if (!token || typeof token !== 'string') {
    return { valid: false, expired: false, message: '토큰이 제공되지 않았거나 형식이 올바르지 않습니다.' };
  }

  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp) {
      return { valid: false, expired: false, message: 'exp 필드(만료 정보)가 없습니다.' };
    }
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) {
      return { valid: false, expired: true, message: '토큰이 만료되었습니다.' };
    }
    return { valid: true, expired: false, message: '토큰이 유효합니다.' };
  } catch (error) {
    return { valid: false, expired: false, message: '비정상적인 토큰입니다. ', error: error };
  }
}

function getAccessToken() {
  return _accessToken;
}

function setAccessToken(token) {
  _accessToken = token;
}

function clearAccessToken() {
  _accessToken = null;
}

async function issueAndSetAccessToken() {
  try {
    const preference = usePreferenceStore.getState().loginPreference;
    const res = await UserClient.issueAccessToken({ autoLogin: preference?.autoLogin || false });
    const accessToken = res?.data?.accessToken;

    if (!accessToken) {
      throw new Error('Access token was not issued.');
    }

    LoginUtil.setAccessToken(accessToken);
  } catch (err) {
    if (err?.response?.status === 401 || err?.response?.status === 403) {
      LoginUtil.clearAccessToken();
      console.warn('Unauthorized', err);
    } else {
      console.error('Failed to issue access token', err);
    }
    throw err;
  }
}

export const LoginUtil = {
  getAccessToken,
  setAccessToken,
  issueAndSetAccessToken,
  clearAccessToken,
  validateJwt,
};
