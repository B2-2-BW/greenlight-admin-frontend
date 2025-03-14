import SideBarMenuList from './SideBarMenuList.jsx';
import SideBarMenuListItem from './SideBarMenuListItem.jsx';
import SideBarMenuDivider from './SideBarMenuDivider.jsx';

export default function SideBar({ menuLists, currentMenuId, onClick }) {
  return (
    <>
      <aside
        id="separator-sidebar"
        className="fixed top-16 left-0 z-40 w-64 h-screen transition-transform translate-x-0"
        aria-label="Sidebar"
      >
        <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50">
          {menuLists.map((menuList, idx) => (
            <div key={idx}>
              {idx > 0 ? <SideBarMenuDivider /> : null}
              <SideBarMenuList>
                {menuList.map((menu) => (
                  <SideBarMenuListItem
                    key={menu.menuId}
                    onClick={() => onClick(menu)}
                    id={menu.menuId}
                    active={currentMenuId === menu.menuId}
                    title={menu.title}
                    append={menu.icon}
                  />
                ))}
              </SideBarMenuList>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
