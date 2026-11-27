import { jwtDecode } from 'jwt-decode';
import { UserClient } from '../api/user/index.js';
import { useUserStore } from '../store/user.jsx';

let _accessToken = null;
let refreshPromise = null;
let logoutPromise = null;
let expiryTimer = null;
let sessionVersion = 0;
let sessionEnded = false;
let sessionMetadata = null;
let sessionStorageAvailable = true;
const SESSION_KEY = 'greenlightRefreshSession';
const SESSION_LOCK = 'greenlightRefreshSessionLock';

function readSession() {
  if (!sessionStorageAvailable) return sessionMetadata;
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : sessionMetadata;
  } catch {
    sessionStorageAvailable = false;
    return sessionMetadata;
  }
}

function writeSession(session) {
  sessionMetadata = session;
  if (!sessionStorageAvailable) return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    sessionStorageAvailable = false;
  }
}

function withSessionLock(callback) {
  return navigator.locks ? navigator.locks.request(SESSION_LOCK, callback) : callback();
}

function hasSession() {
  return Boolean(_accessToken || useUserStore.getState().user?.userId);
}

function endSession(reason, broadcast = true, redirect = true) {
  if (sessionEnded) return;
  const wasActive = hasSession();
  sessionEnded = true;
  sessionVersion += 1;
  window.clearTimeout(expiryTimer);
  _accessToken = null;
  useUserStore.getState().clearUser();

  if (broadcast) {
    writeSession({ ended: reason, at: Date.now() });
  }
  if (redirect && window.location.pathname !== '/login' && window.location.pathname !== '/signin') {
    if (reason === 'expired' && wasActive) {
      window.alert('로그아웃되었습니다');
    }
    window.location.href = '/login';
  }
}

function scheduleExpiry(expiresAt) {
  window.clearTimeout(expiryTimer);
  const expires = Date.parse(expiresAt);
  if (!Number.isFinite(expires)) return;
  expiryTimer = window.setTimeout(() => {
    withSessionLock(() => {
      const current = readSession();
      const currentExpiry = Date.parse(current?.expiresAt);
      if (Number.isFinite(currentExpiry) && currentExpiry > Date.now()) {
        scheduleExpiry(current.expiresAt);
      } else if (Number.isFinite(currentExpiry)) {
        endSession('expired');
      }
    });
  }, Math.max(0, expires - Date.now()));
}

function setSession({ accessToken, refreshExpiresAt }, isLogin = false) {
  if (!accessToken || !Number.isFinite(Date.parse(refreshExpiresAt))) {
    throw new Error('Invalid token response.');
  }
  sessionEnded = false;
  _accessToken = accessToken;
  writeSession({ expiresAt: refreshExpiresAt, ...(isLogin ? { login: Date.now() } : {}) });
  scheduleExpiry(refreshExpiresAt);
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== SESSION_KEY || (!hasSession() && !refreshPromise)) return;
    if (sessionStorageAvailable) {
      try {
        if (event.newValue !== localStorage.getItem(SESSION_KEY)) return;
      } catch {
        sessionStorageAvailable = false;
      }
    }
    let session;
    try {
      session = JSON.parse(event.newValue);
    } catch {
      return;
    }
    sessionMetadata = session;
    if (session?.ended) {
      endSession(session.ended, false);
    } else if (session?.login) {
      endSession('changed', false);
    } else if (session?.expiresAt) {
      scheduleExpiry(session.expiresAt);
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && hasSession()) {
      const session = readSession();
      if (session?.ended) endSession(session.ended, false);
      else if (session?.expiresAt) scheduleExpiry(session.expiresAt);
    }
  });
}

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
    if (decoded.exp <= now) {
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

function clearAccessToken() {
  _accessToken = null;
}

async function login(body) {
  return withSessionLock(async () => {
    const response = await UserClient.login(body);
    if (response?.data?.accessToken) setSession(response.data, true);
    return response;
  });
}

async function issueAndSetAccessToken(rotateRefresh = true) {
  if (sessionEnded || logoutPromise) throw new Error('Session ended.');
  if (!refreshPromise) {
    const version = sessionVersion;
    refreshPromise = withSessionLock(async () => {
      if (version !== sessionVersion) throw new Error('Session ended.');
      const response = await UserClient.issueAccessToken(rotateRefresh);
      if (version !== sessionVersion) throw new Error('Session ended.');
      setSession(response.data);
    }).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function logout() {
  if (!logoutPromise) {
    logoutPromise = (async () => {
      if (refreshPromise) {
        try {
          await refreshPromise;
        } catch {
          // Logout still needs to clear the refresh cookie after a failed refresh.
        }
      }
      return withSessionLock(async () => {
        const response = await UserClient.logout();
        endSession('manual', true, false);
        return response;
      });
    })().finally(() => {
      logoutPromise = null;
    });
  }
  return logoutPromise;
}

function handleAuthFailure() {
  const session = readSession();
  const expires = Date.parse(session?.expiresAt);
  const expired = session?.ended === 'expired' || (Number.isFinite(expires) && expires <= Date.now());
  endSession(expired ? 'expired' : 'unauthorized');
}

export const LoginUtil = {
  getAccessToken,
  isSessionEnded: () => sessionEnded,
  login,
  issueAndSetAccessToken,
  clearAccessToken,
  validateJwt,
  logout,
  handleAuthFailure,
};
