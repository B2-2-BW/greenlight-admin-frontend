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
} from '@heroui/react';
import { SearchIcon } from '../icon/Icons.jsx';
import logo from '../icon/logo.png';
import { useNavigate } from 'react-router';


export default function NavBar() {
  const navigate = useNavigate();

  const goToHome = () => {
    navigate("/events")
  }

  return (
    <Navbar isBordered className="min-w-[800px] flex justify-between" maxWidth="full">
      <NavbarContent justify="start">
        <NavbarBrand className="mr-4">
          {/*<AcmeLogo />*/}
          <p className="block font-bold text-inherit">
            <img src={logo} alt="GreenLight 로고" className="h-auto cursor-pointer hover:opacity-80 transition-opacity" onClick={goToHome}/>
          </p>
        </NavbarBrand>
        <NavbarContent className="flex gap-3">
          <NavbarItem isActive>
            <Link aria-current="page" color="secondary" href="#">
              Navbar는
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link color="foreground" href="#">
              유지할지말지
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="#" color="foreground">
              미정
            </Link>
          </NavbarItem>
        </NavbarContent>
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
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              isBordered
              as="button"
              className="transition-transform"
              color="secondary"
              name="Jason Hughes"
              size="sm"
              src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownItem key="profile" className="h-14 gap-2">
              <p className="font-semibold">Signed in as</p>
              <p className="font-semibold">zoey@example.com</p>
            </DropdownItem>
            <DropdownItem key="settings">My Settings</DropdownItem>
            <DropdownItem key="team_settings">Team Settings</DropdownItem>
            <DropdownItem key="analytics">Analytics</DropdownItem>
            <DropdownItem key="system">System</DropdownItem>
            <DropdownItem key="configurations">Configurations</DropdownItem>
            <DropdownItem key="help_and_feedback">Help & Feedback</DropdownItem>
            <DropdownItem key="logout" color="danger">
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </Navbar>
  );
}
