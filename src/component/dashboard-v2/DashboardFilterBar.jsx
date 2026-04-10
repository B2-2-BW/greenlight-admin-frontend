import { useRef, useState } from 'react';
import { AlertDialog, Button, Disclosure, Dropdown, Label, Tabs, useOverlayState } from '@heroui/react';
import { Gear, Power } from '@gravity-ui/icons';
import { SiteClient } from '../../api/site/index.js';
import { ToastUtil } from '../../util/toastUtil.js';
import { useUserStore } from '../../store/user.jsx';
import { useDashboard } from '../../provider/DashboardProvider.jsx';

const ENVIRONMENTS = [
  { key: 'LIVE', label: 'LIVE' },
  { key: 'DEV', label: 'DEV' },
];

const TAGS = [
  { key: 'api', label: 'API' },
  { key: 'frontend', label: 'Frontend' },
  { key: 'auth', label: 'Auth' },
  { key: 'payment', label: 'Payment' },
  { key: 'notification', label: 'Notification' },
];

function DisableSiteAlert({ isOpen, onOpenChange, onConfirm }) {
  return (
    <AlertDialog isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Backdrop>
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-[400px]">
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>정말로 전체 대기열을 비활성화 하시겠습니까?</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p>전체 대기열이 비활성화되고 현재 대기중인 고객은 즉시 입장하게 됩니다.</p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary">
                취소하기
              </Button>
              <Button slot="close" variant="danger" onPress={onConfirm}>
                전체 대기열 비활성화
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  );
}

const dashboardSettings = [
  {
    key: 'disable-site',
    textValue: '전체 대기열 비활성화',
    variant: 'danger',
    icon: Power,
  },
];

export function DashboardFilterBar() {
  const [selectedEnv, setSelectedEnv] = useState('LIVE');
  const [selectedTags, setSelectedTags] = useState([]);
  const disableSiteAlertState = useOverlayState();

  const { fetchRoomList } = useDashboard();

  const onEnvChange = (env) => {
    console.log('onEnvChange', env);
    setSelectedEnv(env);
  };
  const onTagChange = (tagList) => {
    console.log('onTagChange', tagList);
  };

  const handleDisableSite = async () => {
    const data = {
      siteEnabled: false,
    };

    try {
      // 없는 경우 생성 화면
      const me = useUserStore.getState().user;
      if (me?.siteId == null) {
        ToastUtil.error('저장 실패', '권한이 없습니다.');
        return;
      }
      const response = await SiteClient.updateSiteInfo(me.siteId, data);
      if (response.status !== 200) {
        throw new Error('failed to create room ' + JSON.stringify(response));
      }
      await fetchRoomList();
      ToastUtil.success('시스템 설정', '성공적으로 저장했습니다.');
    } catch (error) {
      console.error(error.response);
      ToastUtil.error('시스템 설정', '저장에 실패했습니다.');
    } finally {
      // TODO loading..?
    }
  };

  //
  // const handleTagChange = (keys) => {
  //   // HeroUI Select는 Selection(Set-like) 객체를 반환
  //   setSelectedTags(keys);
  //   onTagChange(keys);
  // };

  const handleDashboardSetting = (action) => {
    if (action === 'disable-site') {
      disableSiteAlertState.setOpen(true);
    }
  };

  return (
    <div className="flex grow justify-between items-center">
      <div className="w-40">
        <Tabs className="w-full max-w-md" selectedKey={selectedEnv} onSelectionChange={onEnvChange}>
          <Tabs.ListContainer>
            <Tabs.List
              aria-label="Dashboard Bar Environment Tab"
              className="*:data-selected:text-accent-foreground *:h-7"
            >
              {ENVIRONMENTS.map((env) => (
                <Tabs.Tab id={env.key} key={env.key}>
                  {env.label}
                  <Tabs.Indicator className="bg-accent" />
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs.ListContainer>
        </Tabs>
      </div>

      <Dropdown>
        <Button aria-label="dashboard-bar-settings" slot="trigger" variant="secondary" className="text-base">
          <Gear />
          대시보드 설정
        </Button>

        <Dropdown.Popover>
          <Dropdown.Menu onAction={handleDashboardSetting}>
            {dashboardSettings.map((setting) => (
              <Dropdown.Item
                id={setting.key}
                key={setting.key}
                textValue={setting.textValue}
                variant={setting.variant || 'primary'}
              >
                {setting.icon && <setting.icon className={setting.variant ? `text-${setting.variant}` : ''} />}
                <Label className="text-base">{setting.textValue}</Label>
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>

      {/* 구분선 */}
      {/*<ToggleButton isSelected={isSelected} onChange={setIsSelected}>*/}
      {/*  {({ isSelected: selected }) => (*/}
      {/*    <>*/}
      {/*      {selected ? <HeartFill /> : <Heart />}*/}
      {/*      {selected ? 'Liked' : 'Like'}*/}
      {/*    </>*/}
      {/*  )}*/}
      {/*</ToggleButton>*/}

      {/* 태그 필터 */}
      {/*<div className="flex items-center gap-1.5">*/}
      {/*  <span className="text-sm text-default-500 font-medium">태그</span>*/}
      {/*  <Select*/}
      {/*    placeholder="태그 선택"*/}
      {/*    selectionMode="multiple"*/}
      {/*    value={selectedTags}*/}
      {/*    onChange={handleTagChange}*/}
      {/*    variant="bordered"*/}
      {/*    size="sm"*/}
      {/*    className="min-w-[160px]"*/}
      {/*  >*/}
      {/*    <Select.Trigger>*/}
      {/*      <Select.Value />*/}
      {/*      <Select.Indicator />*/}
      {/*    </Select.Trigger>*/}
      {/*    <Select.Popover>*/}
      {/*      <ListBox selectionMode="multiple">*/}
      {/*        {TAGS.map(({ key, label }) => (*/}
      {/*          <ListBox.Item id={key} key={key} textValue={label}>*/}
      {/*            {label}*/}
      {/*            <ListBox.ItemIndicator />*/}
      {/*          </ListBox.Item>*/}
      {/*        ))}*/}
      {/*      </ListBox>*/}
      {/*    </Select.Popover>*/}
      {/*  </Select>*/}
      {/*</div>*/}

      <DisableSiteAlert
        isOpen={disableSiteAlertState.isOpen}
        onOpenChange={disableSiteAlertState.setOpen}
        onConfirm={handleDisableSite}
      />
    </div>
  );
}
