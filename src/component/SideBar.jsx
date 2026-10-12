import SideBarMenuList from './SideBarMenuList.jsx';
import SideBarMenuListItem from './SideBarMenuListItem.jsx';
import { useLocation } from 'react-router';

function SideBarSection({ title, items, pathname, onClose }) {
  if (!items?.length) return null;

  return (
    <section>
      <h2 className="mb-1 px-2 text-xs font-medium text-neutral-400">{title}</h2>
      <SideBarMenuList>
        {items.map((menu) => (
          <SideBarMenuListItem
            key={menu.menuId}
            path={menu.path}
            id={menu.menuId}
            active={!menu.newtab && (pathname === menu.path || pathname.startsWith(`${menu.path}/`))}
            title={menu.title}
            prepend={menu.prependIcon}
            newtab={menu.newtab}
            onNavigate={onClose}
          />
        ))}
      </SideBarMenuList>
    </section>
  );
}

export default function SideBar({ sections, pinnedSection, isOpen = false, onClose }) {
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
        <div className="flex h-full flex-col overflow-y-auto bg-neutral-50 px-3 py-4 shadow-xl lg:shadow-none">
          <div className="flex flex-col gap-6">
            {sections.map((section) => (
              <SideBarSection
                key={section.title}
                title={section.title}
                items={section.items}
                pathname={pathname}
                onClose={onClose}
              />
            ))}
          </div>
          {pinnedSection?.items?.length ? (
            <div className="mt-auto pt-6">
              <SideBarSection
                title={pinnedSection.title}
                items={pinnedSection.items}
                pathname={pathname}
                onClose={onClose}
              />
            </div>
          ) : null}
        </div>
      </aside>
    </>
  );
}
