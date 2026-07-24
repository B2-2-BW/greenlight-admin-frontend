import { Avatar, Button, Dropdown } from '@heroui/react';
import logo from '/logo.png';
import { useNavigate } from 'react-router';
import { useUserStore } from '../store/user.jsx';
import { LoginUtil } from '../util/loginUtil.js';
import { UserClient } from '../api/user/index.js';
import { ToastUtil } from '../util/toastUtil.js';

export default function NavBar() {
  const navigate = useNavigate();

  const { clearUser } = useUserStore();

  const user = useUserStore((s) => s.user);
  const siteLabel = user?.siteName || user?.siteId;
  const showSiteId = user?.siteName && user?.siteId && user.siteName !== user.siteId;

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
    <nav className="sticky top-0 z-40 w-full border-b border-separator bg-background/70 backdrop-blur-lg">
      <header className="flex h-16 items-center justify-between px-6">
        <ul className="flex min-w-0 items-center gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <p className="block font-bold text-inherit">
              <img
                src={logo}
                alt="GreenLight 로고"
                className="h-10 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={goToHome}
              />
            </p>
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
        </ul>

        <ul className="flex items-center gap-4">
          <Dropdown>
            <Button isIconOnly>
              <div className="ring-2 ring-accent rounded-full">
                <Avatar className="border-2 border-white transition-transform">
                  <Avatar.Fallback className="bg-accent text-white">{user?.username?.[0]}</Avatar.Fallback>
                </Avatar>
              </div>
            </Button>
            <Dropdown.Popover>
              <Dropdown.Menu aria-label="계정 메뉴" className="p-3" disabledKeys={['profile']}>
                <Dropdown.Section showDivider aria-label="Profile & Actions">
                  <Dropdown.Item id="profile" isReadOnly className="h-14 gap-2 opacity-100">
                    <div className="inline-flex items-center gap-2">
                      <div className="ring-2 ring-accent rounded-full">
                        <Avatar className="border-2 border-white transition-transform">
                          <Avatar.Fallback className="bg-accent text-white">{user?.username?.[0]}</Avatar.Fallback>
                        </Avatar>
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-sm text-foreground">{user?.username}</span>
                        <span className="text-xs text-muted text-muted">{user?.siteName}</span>
                      </div>
                    </div>
                  </Dropdown.Item>
                  <Dropdown.Item id="account" onPress={() => navigate('/account')}>
                    계정관리
                  </Dropdown.Item>
                </Dropdown.Section>
                <Dropdown.Section aria-label="Logout">
                  <Dropdown.Item onPress={handleLogout} id="logout" variant="danger">
                    로그아웃
                  </Dropdown.Item>
                </Dropdown.Section>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </ul>
      </header>
    </nav>
  );
}
