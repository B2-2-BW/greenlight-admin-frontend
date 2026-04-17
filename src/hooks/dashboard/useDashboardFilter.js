import { useCookies } from 'react-cookie';
import { useState } from 'react';

const COOKIE_NAME = 'dashboard_filter';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1년

export const defaultFilter = {
  theme: 'system',
  // language: 'ko',
  // sidebarCollapsed: false,
  // layout: 'grid',
  roomEnvironment: 'LIVE',
  enabled: ['true'],
};

export function useDashboardFilter() {
  const [cookies, setCookie] = useCookies([COOKIE_NAME]);

  // 저장된 쿠키와 기본값 병합
  const [dashboardFilter, setDashboardFilter] = useState({
    ...defaultFilter,
    ...cookies[COOKIE_NAME],
  });

  // 일부 필드만 업데이트
  const updateDashboardFilter = (partial) => {
    const newFilter = {
      ...dashboardFilter,
      ...partial,
    };
    setDashboardFilter(newFilter);

    setCookie(COOKIE_NAME, newFilter, {
      path: '/',
      maxAge: COOKIE_MAX_AGE,
      sameSite: 'lax',
    });
  };

  return {
    dashboardFilter,
    updateDashboardFilter,
  };
}
