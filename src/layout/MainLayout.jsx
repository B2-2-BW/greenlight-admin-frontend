import SideBar from '../component/SideBar.jsx';
import NavBar from '../component/NavBar.jsx';
import { Outlet, useNavigate } from 'react-router';
import { useState } from 'react';
import ShoppingBagSvg from '../icon/ShoppingBagSvg.jsx';
import PeopleSvg from '../icon/PeopleSvg.jsx';
import { ExternalLinkIcon } from '../icon/Icons.jsx';
import { GRAFANA_URL, JENKINS_URL, ZIPKIN_URL } from '../client/config.js';

const menuLists = [
  [
    {
      title: '이벤트 관리',
      prependIcon: <ShoppingBagSvg />,
      path: '/events',
      menuId: 1,
    },
  ],
  [
    { title: '메뉴 2', prependIcon: <ShoppingBagSvg />, path: '#', menuId: 2 },
    { title: '메뉴 3', prependIcon: <PeopleSvg />, path: '#', menuId: 4 },
    { title: '메뉴 4', prependIcon: <PeopleSvg />, path: '#', menuId: 5 },
    { title: '메뉴 5', prependIcon: <PeopleSvg />, path: '#', menuId: 6 },
  ],
];
const externalMenuList = [
  {
    title: 'Grafana',
    path: GRAFANA_URL,
    prependIcon: <ExternalLinkIcon size={20} color="#111827" />,
    menuId: 7,
  },
  {
    title: 'Jenkins',
    path: JENKINS_URL,
    prependIcon: <ExternalLinkIcon size={20} color="#111827" />,
    menuId: 8,
  },
  {
    title: 'Zipkin',
    path: ZIPKIN_URL,
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
