import SideBarMenuList from './SideBarMenuList.jsx';
import SideBarMenuListItem from './SideBarMenuListItem.jsx';
import SideBarMenuDivider from './SideBarMenuDivider.jsx';

export default function SideBar({ menuLists, currentMenuId, onClick, externalMenuList }) {
  return (
    <>
      <aside
        id="separator-sidebar"
        className="fixed top-16 left-0 z-40 w-52 h-screen transition-transform translate-x-0"
        aria-label="Sidebar"
      >
        <div className="flex flex-col justify-between h-[calc(100%-64px)] px-3 py-4 overflow-y-auto bg-gray-50 ">
          <div>
            {menuLists.map((menuList, idx) => (
              <div key={idx}>
                <SideBarMenuList>
                  {menuList.map((menu) => (
                    <SideBarMenuListItem
                      key={menu.menuId}
                      path={menu.path}
                      onClick={() => onClick(menu)}
                      id={menu.menuId}
                      active={currentMenuId === menu.menuId}
                      title={menu.title}
                      prepend={menu.prependIcon}
                    />
                  ))}
                  <SideBarMenuDivider />
                </SideBarMenuList>
              </div>
            ))}
          </div>
          <div>
            <SideBarMenuList>
              {externalMenuList.map((menu, idx) => (
                <SideBarMenuListItem
                  key={menu.menuId}
                  onClick={() => onClick(menu)}
                  id={menu.menuId}
                  path={menu.path}
                  active={currentMenuId === menu.menuId}
                  title={menu.title}
                  prepend={menu.prependIcon}
                />
              ))}
            </SideBarMenuList>
          </div>
        </div>
      </aside>
    </>
  );
}
