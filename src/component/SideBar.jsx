import SideBarMenuList from './SideBarMenuList.jsx';
import SideBarMenuListItem from './SideBarMenuListItem.jsx';
import { useLocation } from 'react-router';
import { Separator } from '@heroui/react';

export default function SideBar({ menuLists, currentMenuId, externalMenuList, isOpen = false, onClose }) {
  const { pathname } = useLocation();

  return (
    <>
      <button
        type="button"
        aria-label="메뉴 닫기"
        tabIndex={isOpen ? 0 : -1}
        className={`fixed inset-x-0 bottom-0 top-16 z-40 bg-black/40 transition-opacity duration-200 lg:hidden ${
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        id="separator-sidebar"
        className={`fixed bottom-0 left-0 top-16 z-50 w-64 max-w-[85vw] transition-[transform,visibility] duration-200 lg:z-30 lg:w-52 lg:max-w-none lg:translate-x-0 ${
          isOpen
            ? 'visible translate-x-0'
            : 'invisible -translate-x-full delay-200 lg:visible lg:delay-0'
        }`}
        aria-label="주요 메뉴"
      >
        <div className="flex h-full flex-col justify-between overflow-y-auto bg-neutral-50 px-3 py-4 shadow-xl lg:shadow-none">
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
                      onNavigate={onClose}
                    />
                  ))}
                  <li aria-hidden="true">
                    <Separator className="my-4 border-t border-neutral-300" />
                  </li>
                </SideBarMenuList>
              </div>
            ))}
          </div>
          <div>
            <SideBarMenuList>
              {externalMenuList.map((menu) => (
                <SideBarMenuListItem
                  key={menu.menuId}
                  id={menu.menuId}
                  path={menu.path}
                  active={currentMenuId === menu.menuId}
                  title={menu.title}
                  prepend={menu.prependIcon}
                  newtab
                  onNavigate={onClose}
                />
              ))}
            </SideBarMenuList>
          </div>
        </div>
      </aside>
    </>
  );
}
