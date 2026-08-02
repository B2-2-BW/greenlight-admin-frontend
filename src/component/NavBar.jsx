import { Avatar, Button, Chip, Dropdown, ListBox, Select } from '@heroui/react';
import { useCallback, useEffect, useState } from 'react';
import logo from '/logo.png';
import { matchPath, useNavigate } from 'react-router';
import { useUserStore } from '../store/user.jsx';
import { LoginUtil } from '../util/loginUtil.js';
import { UserClient } from '../api/user/index.js';
import { ToastUtil } from '../util/toastUtil.js';
import { ENVIRONMENT_LABEL } from '../client/config.js';
import { getProfileAppearance } from '../util/profileAppearance.js';
import { SiteClient } from '../api/site/index.js';

export default function NavBar({ isSidebarOpen = false, onSidebarToggle }) {
  const navigate = useNavigate();

  const { clearUser, setSelectedSiteId } = useUserStore();

  const user = useUserStore((s) => s.user);
  const selectedSiteId = useUserStore((s) => s.selectedSiteId);
  const [sites, setSites] = useState([]);
  const [sitesLoading, setSitesLoading] = useState(false);
  const role = user?.userRole ?? user?.role;
  const isSuper = role === 'SUPER';
  const siteLabel = user?.siteName || user?.siteId;
  const showSiteId = user?.siteName && user?.siteId && user.siteName !== user.siteId;
  const { profileColor, profileInitials } = getProfileAppearance(user);

  const changeSite = useCallback(
    (siteId) => {
      if (!siteId || siteId === useUserStore.getState().selectedSiteId) return;

      setSelectedSiteId(siteId);
      const pathname = window.location.pathname;
      if (matchPath('/rooms/:roomId', pathname)) {
        navigate('/rooms', { replace: true });
      } else if (matchPath('/users/:userId', pathname)) {
        navigate('/users', { replace: true });
      } else {
        window.location.reload();
      }
    },
    [navigate, setSelectedSiteId]
  );

  useEffect(() => {
    if (!isSuper) return undefined;
    const controller = new AbortController();
    let cancelled = false;

    const loadSites = async () => {
      setSitesLoading(true);
      try {
        const firstResponse = await SiteClient.getSites({ page: 1, size: 100, signal: controller.signal });
        const firstPage = firstResponse.data ?? {};
        const remainingResponses = await Promise.all(
          Array.from({ length: Math.max(0, (firstPage.totalPages ?? 1) - 1) }, (_, index) =>
            SiteClient.getSites({ page: index + 2, size: 100, signal: controller.signal })
          )
        );
        if (cancelled) return;
        const loadedSites = [
          ...(firstPage.content ?? []),
          ...remainingResponses.flatMap((response) => response.data?.content ?? []),
        ];
        setSites(loadedSites);

        const fallbackSiteId = loadedSites.some((site) => site.siteId === user?.siteId)
          ? user.siteId
          : loadedSites[0]?.siteId;
        const currentSiteId = useUserStore.getState().selectedSiteId;
        if (!loadedSites.some((site) => site.siteId === currentSiteId) && fallbackSiteId) {
          changeSite(fallbackSiteId);
        }
      } catch (error) {
        if (error.code !== 'ERR_CANCELED') {
          console.error(error);
          ToastUtil.error('사이트 선택', '사이트 목록을 불러오지 못했습니다.');
        }
      } finally {
        if (!cancelled) setSitesLoading(false);
      }
    };

    loadSites();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [changeSite, isSuper, user?.siteId]);

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
            {isSuper ? (
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <div className="hidden h-6 w-px bg-separator sm:block" aria-hidden="true" />
                <Select
                  aria-label="운영 사이트"
                  value={selectedSiteId || user?.siteId || ''}
                  onChange={changeSite}
                  isDisabled={sitesLoading || sites.length === 0}
                  className="w-28 sm:w-56"
                  variant="secondary"
                >
                  <Select.Trigger className="h-10">
                    <Select.Value>{({ state }) => state.selectedItems[0]?.textValue ?? '사이트 선택'}</Select.Value>
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {sites.map((site) => {
                        const label = `${site.siteEnabled ? '' : '(비활성) '}${site.siteName || site.siteId} (${site.siteId})`;
                        return (
                          <ListBox.Item key={site.siteId} id={site.siteId} textValue={label}>
                            {label}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        );
                      })}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>
            ) : siteLabel ? (
              <div className="hidden min-w-0 items-center gap-3 sm:flex">
                <div className="h-6 w-px bg-separator" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground" title={siteLabel}>
                    {siteLabel}
                  </p>
                  {showSiteId && <p className="truncate text-xs text-muted">{user.siteId}</p>}
                </div>
              </div>
            ) : null}
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
            <Dropdown.Popover
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
