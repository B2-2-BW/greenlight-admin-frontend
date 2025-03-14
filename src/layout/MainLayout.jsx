import SideBar from '../component/SideBar.jsx';
import NavBar from '../component/NavBar.jsx';
import { Outlet, useNavigate } from 'react-router';
import { useState } from 'react';
import ShoppingBagSvg from '../icon/ShoppingBagSvg.jsx';
import PeopleSvg from '../icon/PeopleSvg.jsx';

const menuLists = [
  [
    {
      title: '이벤트 관리',
      icon: <ShoppingBagSvg />,
      path: '/events',
      menuId: 1,
    },
  ],
  [
    { title: '메뉴 2', icon: <ShoppingBagSvg />, path: '#', menuId: 2 },
    { title: '메뉴 3', icon: <ShoppingBagSvg />, path: '#', menuId: 3 },
    { title: '메뉴 4', icon: <PeopleSvg />, path: '#', menuId: 4 },
    { title: '메뉴 5', icon: <PeopleSvg />, path: '#', menuId: 5 },
    { title: '메뉴 6', icon: <PeopleSvg />, path: '#', menuId: 6 },
  ],
];

export default function MainLayout() {
  const [currentMenuId, setCurrentMenuId] = useState(null);
  // if (currentMenu == null) do something
  const handleMenuClick = (menu) => {
    // const item = navItems.find((it) => it.key === key);
    // if (item.path) {
    //   navigate(item.path);
    // }
    // if (item.label === '만들기') {
    //   openCreatePost();
    // }
    console.log(menu);
  };
  const navigate = useNavigate();
  return (
    <div className="MainLayout">
      <SideBar
        menuLists={menuLists}
        currentMenuId={currentMenuId}
        onClick={handleMenuClick}
      />
      <NavBar />
      <div className="ml-[256px] overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
