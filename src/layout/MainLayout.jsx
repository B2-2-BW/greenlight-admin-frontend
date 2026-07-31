import SideBar from '../component/SideBar.jsx';
import NavBar from '../component/NavBar.jsx';
import { Outlet, useLocation } from 'react-router';
import { useEffect, useState } from 'react';
import {
  CalendarIcon,
  ClipboardFilledIcon,
  ExternalLinkIcon,
  HomeIcon,
  SettingsFilledIcon,
  SquareChartFilledIcon,
  UserFilledIcon,
} from '../icon/Icons.jsx';
import { GRAFANA_EXTERNAL_URL, JENKINS_EXTERNAL_URL } from '../client/config.js';
import { useUserStore } from '../store/user.jsx';

const externalMenuList = [
  {
    title: 'Grafana',
    path: GRAFANA_EXTERNAL_URL,
    prependIcon: <ExternalLinkIcon size={20} color="#111827" />,
    menuId: 27,
  },
  {
    title: 'Jenkins',
    path: JENKINS_EXTERNAL_URL,
    prependIcon: <ExternalLinkIcon size={20} color="#111827" />,
    menuId: 28,
  },
];
export default function MainLayout() {
  const { pathname } = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const role = useUserStore((state) => state.user?.userRole ?? state.user?.role);
  const canManageUsers = role === 'SITE_ADMIN' || role === 'SUPER';
  const isSuper = role === 'SUPER';
  const menuLists = [
    [
      { title: '대시보드', prependIcon: <HomeIcon color="#6b7280" />, path: '/dashboard', menuId: 2 },
      {
        title: '대기열 목록',
        prependIcon: <CalendarIcon color="#6b7280" />,
        path: '/rooms',
        menuId: 3,
      },
      {
        title: '대기열 통계',
        prependIcon: <SquareChartFilledIcon color="#6b7280" />,
        path: '/queue-statistics',
        menuId: 18,
      },
    ],
    [
      {
        title: '시스템 설정',
        prependIcon: <SettingsFilledIcon color="#6b7280" />,
        path: '/settings',
        menuId: 15,
      },
      ...(canManageUsers
        ? [
            {
              title: '사용자 관리',
              prependIcon: <UserFilledIcon color="#6b7280" />,
              path: '/users',
              menuId: 16,
            },
            ...(isSuper
              ? [
                  {
                    title: '사이트 관리',
                    prependIcon: <ClipboardFilledIcon color="#6b7280" />,
                    path: '/sites',
                    menuId: 17,
                  },
                ]
              : []),
            {
              title: '감사로그',
              prependIcon: <ClipboardFilledIcon color="#6b7280" />,
              path: '/audit-logs',
              menuId: 19,
            },
            ...(isSuper
              ? [
                  {
                    title: '시스템 상태',
                    prependIcon: <SquareChartFilledIcon color="#6b7280" />,
                    path: '/system-status',
                    menuId: 20,
                  },
                ]
              : []),
          ]
        : []),
    ],
  ];

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => setIsSidebarOpen(false));
    return () => window.cancelAnimationFrame(animationFrame);
  }, [pathname]);

  useEffect(() => {
    if (!isSidebarOpen) return undefined;

    const desktopMediaQuery = window.matchMedia('(min-width: 1024px)');
    const previousOverflow = document.body.style.overflow;
    const updateBodyScroll = () => {
      document.body.style.overflow = desktopMediaQuery.matches ? previousOverflow : 'hidden';
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsSidebarOpen(false);
    };

    updateBodyScroll();
    desktopMediaQuery.addEventListener('change', updateBodyScroll);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      desktopMediaQuery.removeEventListener('change', updateBodyScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSidebarOpen]);

  return (
    <div className="MainLayout min-h-dvh pt-16">
      <NavBar
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen((isOpen) => !isOpen)}
      />
      <SideBar
        menuLists={menuLists}
        externalMenuList={externalMenuList}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="min-w-0 lg:ml-52">
        <Outlet />
      </div>
    </div>
  );
}
