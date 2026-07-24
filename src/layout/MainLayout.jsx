import SideBar from '../component/SideBar.jsx';
import NavBar from '../component/NavBar.jsx';
import { Outlet } from 'react-router';
import { CalendarIcon, ExternalLinkIcon, HomeIcon, SettingsFilledIcon, UserFilledIcon } from '../icon/Icons.jsx';
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
  const role = useUserStore((state) => state.user?.userRole ?? state.user?.role);
  const canManageUsers = role === 'SITE_ADMIN' || role === 'SUPER';
  const menuLists = [
    [
      { title: '대시보드', prependIcon: <HomeIcon color="#6b7280" />, path: '/dashboard', menuId: 2 },
      {
        title: '대기열',
        prependIcon: <CalendarIcon color="#6b7280" />,
        path: '/rooms',
        menuId: 3,
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
            {
              title: '사이트 관리',
              prependIcon: <SettingsFilledIcon color="#6b7280" />,
              path: '/sites',
              menuId: 17,
            },
          ]
        : []),
    ],
  ];

  return (
    <div className="MainLayout ">
      <SideBar menuLists={menuLists} externalMenuList={externalMenuList} />
      <NavBar />
      <div className="ml-52 overflow-none ">
        <Outlet />
      </div>
    </div>
  );
}
