import SideBarMenuList from './SideBarMenuList.jsx';
import SideBarMenuListItem from './SideBarMenuListItem.jsx';
import SideBarMenuDivider from './SideBarMenuDivider.jsx';
import { useLocation } from 'react-router';
import { Separator } from '@heroui/react';

export default function SideBar({ menuLists, currentMenuId, externalMenuList }) {
  const { pathname } = useLocation();

  return (
    <>
      <aside
        id="separator-sidebar"
        className="fixed top-16 left-0 z-40 w-52 h-screen transition-transform translate-x-0"
        aria-label="Sidebar"
      >
        <div className="flex flex-col justify-between h-[calc(100%-64px)] px-3 py-4 overflow-y-auto bg-neutral-50 ">
          <div>
            {menuLists.map((menuList, idx) => (
              <div key={idx}>
                <SideBarMenuList>
                  {menuList.map((menu) => (
                    <SideBarMenuListItem
                      key={menu.menuId}
                      path={menu.path}
                      id={menu.menuId}
                      active={pathname === menu.path || pathname.startsWith(menu.path + '/')}
                      title={menu.title}
                      prepend={menu.prependIcon}
                    />
                  ))}
                  <Separator className="my-4 border-t border-neutral-300" />
                </SideBarMenuList>
              </div>
            ))}
          </div>
          <div>
            <SideBarMenuList>
              {externalMenuList.map((menu, idx) => (
                <SideBarMenuListItem
                  key={menu.menuId}
                  id={menu.menuId}
                  path={menu.path}
                  active={currentMenuId === menu.menuId}
                  title={menu.title}
                  prepend={menu.prependIcon}
                  newtab
                />
              ))}
            </SideBarMenuList>
          </div>
        </div>
      </aside>
    </>
  );
}
