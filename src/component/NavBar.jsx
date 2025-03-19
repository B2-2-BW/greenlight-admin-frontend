import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Input,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Avatar,
  Divider,
  DropdownSection,
  User,
} from '@heroui/react';
import logo from '/logo.png';
import { useNavigate } from 'react-router';
import { useUserStore } from '../store/user.jsx';

export default function NavBar() {
  const navigate = useNavigate();

  const { user, setUser } = useUserStore();

  const goToHome = () => {
    navigate('/events');
  };

  const handleLogout = () => {
    setUser(null);
    useUserStore.persist.clearStorage();
    window.localStorage.removeItem('user');
    navigate(0);
  };

  return (
    <Navbar isBordered className="min-w-[800px] flex justify-between" maxWidth="full">
      <NavbarContent justify="start">
        <NavbarBrand className="mr-4">
          <p className="block font-bold text-inherit">
            <img
              src={logo}
              alt="GreenLight 로고"
              className="h-10 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={goToHome}
            />
          </p>
        </NavbarBrand>
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
      </NavbarContent>

      <NavbarContent as="div" className="items-center" justify="end">
        {/*<Input*/}
        {/*  classNames={{*/}
        {/*    base: 'max-w-full sm:max-w-[10rem] h-10',*/}
        {/*    mainWrapper: 'h-full',*/}
        {/*    input: 'text-small',*/}
        {/*    inputWrapper: 'h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20',*/}
        {/*  }}*/}
        {/*  placeholder="Type to search..."*/}
        {/*  size="sm"*/}
        {/*  startContent={<SearchIcon size={18} />}*/}
        {/*  type="search"*/}
        {/*/>*/}
        <Dropdown
          showArrow
          classNames={{
            base: 'before:bg-default-200', // change arrow background
            content: 'p-0 border-small border-divider bg-background',
          }}
          radius="sm"
        >
          <DropdownTrigger>
            <Avatar isBordered as="button" className="transition-transform" color="primary" name="Admin" size="sm" />
          </DropdownTrigger>
          <DropdownMenu aria-label="Custom item styles" className="p-3" disabledKeys={['profile']} variant="flat">
            <DropdownSection showDivider aria-label="Profile & Actions">
              <DropdownItem key="profile" isReadOnly className="h-14 gap-2 opacity-100">
                <User
                  avatarProps={{
                    name: 'Admin',
                    size: 'sm',
                    className: 'transition-transform',
                    color: 'primary',
                  }}
                  classNames={{
                    name: 'text-default-600',
                    description: 'text-default-500',
                  }}
                  description="@더현대닷컴"
                  name="admin"
                />
              </DropdownItem>
              <DropdownItem key="dashboard">계정관리</DropdownItem>
            </DropdownSection>

            <DropdownSection showDivider aria-label="Help & Feedback">
              <DropdownItem key="settings">설정</DropdownItem>
              <DropdownItem key="settings_2">작업</DropdownItem>
              <DropdownItem key="help_and_feedback">도움말</DropdownItem>
            </DropdownSection>
            <DropdownSection aria-label="Logout">
              <DropdownItem onPress={handleLogout} key="logout" color="danger">
                로그아웃
              </DropdownItem>
            </DropdownSection>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </Navbar>
  );
}
