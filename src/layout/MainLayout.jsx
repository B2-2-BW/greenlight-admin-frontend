import SideBar from '../component/SideBar.jsx';
import NavBar from '../component/NavBar.jsx';
import { Outlet, useLocation } from 'react-router';
import { useEffect, useState } from 'react';
import {
  ActivityFilledIcon,
  BellFilledIcon,
  CalendarIcon,
  ClipboardFilledIcon,
  ClockFilledIcon,
  DocumentFilledIcon,
  ExternalLinkIcon,
  HomeIcon,
  PauseFilledIcon,
  SettingsFilledIcon,
  SquareChartFilledIcon,
  UserFilledIcon,
} from '../icon/Icons.jsx';
import { GRAFANA_EXTERNAL_URL, JENKINS_EXTERNAL_URL } from '../client/config.js';
import { useUserStore } from '../store/user.jsx';

const iconColor = '#6b7280';

const externalMenuList = [
  {
    title: 'Grafana',
    path: GRAFANA_EXTERNAL_URL,
    prependIcon: <ExternalLinkIcon size={20} color="#111827" />,
    menuId: 27,
    newtab: true,
  },
  {
    title: 'Jenkins',
    path: JENKINS_EXTERNAL_URL,
    prependIcon: <ExternalLinkIcon size={20} color="#111827" />,
    menuId: 28,
    newtab: true,
  },
];
export default function MainLayout() {
  const { pathname } = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const role = useUserStore((state) => state.user?.userRole ?? state.user?.role);
  const canManageUsers = role === 'SITE_ADMIN' || role === 'SUPER';
  const isSuper = role === 'SUPER';
  const manageItems = canManageUsers
    ? [
        {
          title: '사용자 관리',
          prependIcon: <UserFilledIcon color={iconColor} />,
          path: '/users',
          menuId: 16,
        },
        ...(isSuper
          ? [
              {
                title: '사이트 관리',
                prependIcon: <ClipboardFilledIcon color={iconColor} />,
                path: '/sites',
                menuId: 17,
              },
            ]
          : []),
        {
          title: '감사로그',
          prependIcon: <DocumentFilledIcon color={iconColor} />,
          path: '/audit-logs',
          menuId: 19,
        },
        ...(isSuper
          ? [
              {
                title: '시스템 관리',
                prependIcon: <ActivityFilledIcon color={iconColor} />,
                path: '/system-status',
                menuId: 20,
              },
            ]
          : []),
      ]
    : [];
  const sections = [
    {
      title: '운영',
      items: [
        { title: '대시보드', prependIcon: <HomeIcon color={iconColor} />, path: '/dashboard', menuId: 2 },
        {
          title: '대기열 목록',
          prependIcon: <CalendarIcon color={iconColor} />,
          path: '/rooms',
          menuId: 3,
        },
        {
          title: '대기열 통계',
          prependIcon: <SquareChartFilledIcon color={iconColor} />,
          path: '/queue-statistics',
          menuId: 18,
        },
        {
          title: '사이트 설정',
          prependIcon: <SettingsFilledIcon color={iconColor} />,
          path: '/settings',
          menuId: 15,
        },
      ],
    },
    {
      title: '알림',
      items: [
        {
          title: '알림 설정',
          prependIcon: <BellFilledIcon color={iconColor} />,
          path: '/alert-settings',
          menuId: 21,
        },
        {
          title: '플랜다운',
          prependIcon: <PauseFilledIcon color={iconColor} />,
          path: '/alert-silences',
          menuId: 23,
        },
        ...(isSuper
          ? [
              {
                title: '알림 이력',
                prependIcon: <ClockFilledIcon color={iconColor} />,
                path: '/alert-logs',
                menuId: 22,
              },
            ]
          : []),
      ],
    },
    ...(manageItems.length > 0 ? [{ title: '관리', items: manageItems }] : []),
  ];
  const pinnedSection = {
    title: '모니터링',
    items: externalMenuList,
  };

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
    <div className="MainLayout min-h-dvh bg-neutral-50 pt-16">
      <NavBar
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen((isOpen) => !isOpen)}
      />
      <SideBar
        sections={sections}
        pinnedSection={pinnedSection}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="min-w-0 lg:ml-52">
        <Outlet />
      </div>
    </div>
  );
}
