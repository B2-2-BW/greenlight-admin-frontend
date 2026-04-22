import { Avatar, Button, Dropdown, Label } from '@heroui/react';
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
        <ul className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <p className="block font-bold text-inherit">
              <img
                src={logo}
                alt="GreenLight 로고"
                className="h-10 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={goToHome}
              />
            </p>
          </div>
          {/*<NavbarContent className="flex gap-3">*/}
          {/*  <NavbarItem isActive>*/}
          {/*    <Link aria-current="page" color="secondary" href="#">*/}
          {/*      Navbar는*/}
          {/*    </Link>*/}
          {/*  </NavbarItem>*/}
          {/*  <NavbarItem>*/}
          {/*    <Link color="foreground" href="#">*/}
          {/*      유지할지말지*/}
          {/*    </Link>*/}
          {/*  </NavbarItem>*/}
          {/*  <NavbarItem>*/}
          {/*    <Link href="#" color="foreground">*/}
          {/*      미정*/}
          {/*    </Link>*/}
          {/*  </NavbarItem>*/}
          {/*</NavbarContent>*/}
        </ul>

        <ul className="flex items-center gap-4">
          {/*<Input*/}
          {/*  classNames={{*/}
          {/*    base: 'max-w-full sm:max-w-40 h-10',*/}
          {/*    mainWrapper: 'h-full',*/}
          {/*    input: 'text-small',*/}
          {/*    inputWrapper: 'h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20',*/}
          {/*  }}*/}
          {/*  placeholder="Type to search..."*/}
          {/*  size="sm"*/}
          {/*  startContent={<SearchIcon size={18} />}*/}
          {/*  type="search"*/}
          {/*/>*/}
          {/*TODO DROPDOWN 마우스 pointer 안되고, 포커스랑 위치 좀 이상함 */}
          <Dropdown>
            <Button isIconOnly>
              <div className="ring-2 ring-accent rounded-full">
                <Avatar className="border-2 border-white transition-transform">
                  <Avatar.Fallback className="bg-accent text-white">{user?.username?.[0]}</Avatar.Fallback>
                </Avatar>
              </div>
            </Button>
            <Dropdown.Popover>
              <Dropdown.Menu aria-label="Custom item styles" className="p-3" disabledKeys={['profile']} variant="flat">
                <Dropdown.Section showDivider aria-label="Profile & Actions">
                  <Dropdown.Item id="profile" isReadOnly className="h-14 gap-2 opacity-100">
                    <div className="inline-flex items-center gap-2">
                      <div className="ring-2 ring-accent rounded-full">
                        <Avatar className="border-2 border-white transition-transform">
                          <Avatar.Fallback className="bg-accent text-white">{user?.username?.[0]}</Avatar.Fallback>
                        </Avatar>
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-sm text-default-600">{user?.username}</span>
                        <span className="text-xs text-muted text-default-500">{user?.siteName}</span>
                      </div>
                    </div>
                  </Dropdown.Item>
                  <Dropdown.Item id="dashboard">
                    <Label>계정관리</Label>
                  </Dropdown.Item>
                </Dropdown.Section>

                <Dropdown.Section showDivider aria-label="Help & Feedback">
                  <Dropdown.Item id="settings">
                    <Label>설정</Label>
                  </Dropdown.Item>
                  <Dropdown.Item id="settings_2">
                    <Label>작업</Label>
                  </Dropdown.Item>
                  <Dropdown.Item id="help_and_feedback">
                    <Label>도움말</Label>
                  </Dropdown.Item>
                </Dropdown.Section>
                <Dropdown.Section aria-label="Logout">
                  <Dropdown.Item onPress={handleLogout} id="logout" variant="danger">
                    <Label>로그아웃</Label>
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
