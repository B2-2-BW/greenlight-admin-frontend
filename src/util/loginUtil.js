import { jwtDecode } from 'jwt-decode';

/**
 * JWT 토큰의 만료 및 비정상 여부를 검사합니다.
 * @param {string} token - 검사할 JWT 토큰
 * @returns {{ valid: boolean, expired: boolean, message: string }} 결과 객체
 */
function validateJwtToken(token) {
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
    return { valid: false, expired: false, message: '토큰 파싱에 실패했습니다. 토큰이 비정상적입니다.' };
  }
}

function getToken() {
  let token = sessionStorage.getItem('accessToken');
  if (!token) {
    token = localStorage.getItem('accessToken');
  }
  return token;
}
function clearToken() {
  sessionStorage.removeItem('accessToken');
  localStorage.removeItem('accessToken');
}
function saveToken(accessToken, rememberUser = false) {
  const storage = rememberUser ? localStorage : sessionStorage;
  storage.setItem('accessToken', accessToken);
}
function isTokenValid() {
  const token = LoginUtil.getToken();
  const result = validateJwtToken(token);
  if (!result.valid) {
    clearToken();
  }
  return result.valid;
}

export const LoginUtil = {
  getToken,
  clearToken,
  saveToken,
  isTokenValid,
};
