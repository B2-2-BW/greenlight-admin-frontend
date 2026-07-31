import { Avatar, Button, Chip, Dropdown } from '@heroui/react';
import logo from '/logo.png';
import { useNavigate } from 'react-router';
import { useUserStore } from '../store/user.jsx';
import { LoginUtil } from '../util/loginUtil.js';
import { UserClient } from '../api/user/index.js';
import { ToastUtil } from '../util/toastUtil.js';
import { ENVIRONMENT_LABEL } from '../client/config.js';
import { getProfileAppearance } from '../util/profileAppearance.js';

export default function NavBar({ isSidebarOpen = false, onSidebarToggle }) {
  const navigate = useNavigate();

  const { clearUser } = useUserStore();

  const user = useUserStore((s) => s.user);
  const siteLabel = user?.siteName || user?.siteId;
  const showSiteId = user?.siteName && user?.siteId && user.siteName !== user.siteId;
  const { profileColor, profileInitials } = getProfileAppearance(user);

  const goToHome = () => {
    navigate('/');
  };

  const handleLogout = () => {
    UserClient.logout()
      .then((res) => {
        if (res.status === 200) {
          useUserStore.persist.clearStorage();
          clearUser();
          LoginUtil.clearAccessToken();

          ToastUtil.success('로그아웃 성공', `정상적으로 로그아웃되었습니다.`);
          navigate('/login');
        } else {
          ToastUtil.error('로그아웃 실패', `error: ${res.message}`);
        }
      })
      .catch((error) => {
        ToastUtil.error('로그아웃 실패', `error: ${error}`);
      });
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-60 w-full border-b border-separator bg-background/90 backdrop-blur-lg">
      <header className="flex h-16 items-center justify-between gap-2 px-3 sm:px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:hidden"
            aria-label={isSidebarOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-controls="separator-sidebar"
            aria-expanded={isSidebarOpen}
            onClick={onSidebarToggle}
          >
            {isSidebarOpen ? (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="cursor-pointer shrink-0 rounded-lg transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              aria-label="홈으로 이동"
              onClick={goToHome}
            >
              <img src={logo} alt="GreenLight 로고" className="h-8 w-auto sm:h-10" />
            </button>
            {ENVIRONMENT_LABEL && (
              <Chip size="sm" color="warning" variant="soft" className="shrink-0 sm:hidden">
                {ENVIRONMENT_LABEL}
              </Chip>
            )}
            {ENVIRONMENT_LABEL && (
              <Chip size="md" color="warning" variant="soft" className="hidden shrink-0 sm:inline-flex">
                {ENVIRONMENT_LABEL}
              </Chip>
            )}
            {siteLabel && (
              <div className="hidden min-w-0 items-center gap-3 sm:flex">
                <div className="h-6 w-px bg-separator" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground" title={siteLabel}>
                    {siteLabel}
                  </p>
                  {showSiteId && <p className="truncate text-xs text-muted">{user.siteId}</p>}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center">
          <Dropdown>
            <Button isIconOnly aria-label="계정 메뉴 열기">
              <div className="rounded-full" style={{ boxShadow: `0 0 0 2px ${profileColor}` }}>
                <Avatar className="border-2 border-white transition-transform">
                  <Avatar.Fallback className="text-white" style={{ backgroundColor: profileColor }}>
                    {profileInitials}
                  </Avatar.Fallback>
                </Avatar>
              </div>
            </Button>
            {/* Keep account actions over the page without locking the root scroll container. */}
            <Dropdown.Popover
              isNonModal
              placement="bottom end"
              containerPadding={16}
              offset={16}
              className="profile-dropdown-popover"
            >
              <Dropdown.Menu aria-label="계정 메뉴" className="p-3" disabledKeys={['profile']}>
                <Dropdown.Section showDivider aria-label="Profile & Actions">
                  <Dropdown.Item id="profile" isReadOnly className="h-14 gap-2 opacity-100">
                    <div className="inline-flex w-full min-w-0 items-center gap-2">
                      <div
                        className="shrink-0 rounded-full"
                        style={{ boxShadow: `0 0 0 2px ${profileColor}` }}
                      >
                        <Avatar className="border-2 border-white transition-transform">
                          <Avatar.Fallback className="text-white" style={{ backgroundColor: profileColor }}>
                            {profileInitials}
                          </Avatar.Fallback>
                        </Avatar>
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col items-start">
                        <span className="w-full truncate text-sm text-foreground" title={user?.username}>
                          {user?.username}
                        </span>
                        <span className="w-full truncate text-xs text-muted" title={user?.siteName}>
                          {user?.siteName}
                        </span>
                      </div>
                    </div>
                  </Dropdown.Item>
                  <Dropdown.Item id="account" className="min-h-11 sm:min-h-9" onPress={() => navigate('/account')}>
                    계정관리
                  </Dropdown.Item>
                </Dropdown.Section>
                <Dropdown.Section aria-label="Logout">
                  <Dropdown.Item onPress={handleLogout} id="logout" variant="danger" className="min-h-11 sm:min-h-9">
                    로그아웃
                  </Dropdown.Item>
                </Dropdown.Section>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>
      </header>
    </nav>
  );
}
