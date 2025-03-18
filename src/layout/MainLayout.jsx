import SideBar from '../component/SideBar.jsx';
import NavBar from '../component/NavBar.jsx';
import { Outlet, useNavigate } from 'react-router';
import { useState } from 'react';
import { CalendarIcon, ExternalLinkIcon, HomeIcon } from '../icon/Icons.jsx';
import { GRAFANA_EXTERNAL_URL, JENKINS_EXTERNAL_URL, ZIPKIN_EXTERNAL_URL } from '../client/config.js';

const menuLists = [
  [
    { title: '대시보드', prependIcon: <HomeIcon color="#6b7280" />, path: '/dashboard', menuId: 2 },
    {
      title: '이벤트 관리',
      prependIcon: <CalendarIcon color="#6b7280" />,
      path: '/events',
      menuId: 1,
    },
  ],
];
const externalMenuList = [
  {
    title: 'Grafana',
    path: GRAFANA_EXTERNAL_URL,
    prependIcon: <ExternalLinkIcon size={20} color="#111827" />,
    menuId: 7,
  },
  {
    title: 'Jenkins',
    path: JENKINS_EXTERNAL_URL,
    prependIcon: <ExternalLinkIcon size={20} color="#111827" />,
    menuId: 8,
  },
  {
    title: 'Zipkin',
    path: ZIPKIN_EXTERNAL_URL,
    prependIcon: <ExternalLinkIcon size={20} color="#111827" />,
    menuId: 9,
  },
];
export default function MainLayout() {
  const [currentMenuId, setCurrentMenuId] = useState(null);
  // if (currentMenu == null) do something
  const handleMenuClick = (menu) => {
    if (!menu.path && !menu.link) return;

    if (menu.path) {
      navigate(menu.path);
    }
    if (menu.link) {
      window.open(menu.link);
    }
  };
  const navigate = useNavigate();
  return (
    <div className="MainLayout">
      <SideBar
        menuLists={menuLists}
        currentMenuId={currentMenuId}
        onClick={handleMenuClick}
        externalMenuList={externalMenuList}
      />
      <NavBar />
      <div className="ml-52 overflow-none">
        <Outlet />
      </div>
    </div>
  );
}
