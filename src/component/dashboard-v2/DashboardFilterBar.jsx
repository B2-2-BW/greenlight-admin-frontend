import { useCallback, useState } from 'react';
import { AlertDialog, Button, Dropdown, Input, Label, ListBox, Select, Tabs, TextField, useOverlayState } from '@heroui/react';
import { Funnel, Gear, Power } from '@gravity-ui/icons';
import { SiteClient } from '../../api/site/index.js';
import { ToastUtil } from '../../util/toastUtil.js';
import { useUserStore } from '../../store/user.jsx';
import { useDashboard } from '../../provider/DashboardProvider.jsx';
import { usePreferenceStore } from '../../store/preference.jsx';
import { getEffectiveSiteId } from '../../util/siteUtil.js';

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

function EnvironmentFilterSelect({ selectedKey, onSelectionChange }) {
  return (
    <Tabs className="w-40" selectedKey={selectedKey} onSelectionChange={onSelectionChange}>
      <Tabs.ListContainer>
        <Tabs.List aria-label="Dashboard Bar Environment Tab" className="*:data-selected:text-accent-foreground *:h-7">
          {ENVIRONMENTS.map((env) => (
            <Tabs.Tab id={env.key} key={env.key}>
              {env.label}
              <Tabs.Indicator className="bg-accent" />
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs.ListContainer>
    </Tabs>
  );
}

function EnabledFilterSelect({ value, onChange }) {
  // value: true | false | null

  const convertEnabledSelectionToLabel = useCallback((keys) => {
    if (!keys) {
      return '상태';
    }
    const hasTrue = keys.includes('true');
    const hasFalse = keys.includes('false');
    if (hasTrue && hasFalse) {
      return '모두';
    } else if (hasTrue) {
      return '활성';
    } else if (hasFalse) {
      return '비활성';
    } else {
      return '상태';
    }
  }, []);

  const enabledSelectFilterLabel = convertEnabledSelectionToLabel(value);

  return (
    <Select
      placeholder="대기열 활성상태"
      selectionMode="multiple"
      value={value}
      onChange={(keys) => onChange({ enabled: keys })}
    >
      <Button className="text-base" variant={enabledSelectFilterLabel === '상태' ? 'tertiary' : 'secondary'}>
        <Funnel />
        {enabledSelectFilterLabel}
      </Button>
      <Select.Popover className="w-32" placement="bottom start">
        <ListBox selectionMode="multiple">
          <ListBox.Item id="true" textValue="활성">
            <ListBox.ItemIndicator />
            활성
          </ListBox.Item>
          <ListBox.Item id="false" textValue="비활성">
            <ListBox.ItemIndicator />
            비활성
          </ListBox.Item>
        </ListBox>
      </Select.Popover>
    </Select>
  );
}

function DisableQueueAlert({ isOpen, onOpenChange, onConfirm, reason, onReasonChange }) {
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
              <p>
                이후 신규 티켓 발급 요청은 대기 없이 통과합니다. 이미 발급된 티켓에는 즉시 적용되지 않습니다.
              </p>
              <TextField className="mt-4 w-full" isRequired>
                <Label>변경 사유</Label>
                <Input
                  value={reason}
                  maxLength={1000}
                  onChange={(event) => onReasonChange(event.target.value)}
                />
              </TextField>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary">
                취소하기
              </Button>
              <Button slot="close" variant="danger" onPress={onConfirm} isDisabled={!reason.trim()}>
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
    key: 'disable-queue',
    textValue: '전체 대기열 비활성화',
    variant: 'danger',
    icon: Power,
  },
];

export function DashboardFilterBar() {
  const disableQueueAlertState = useOverlayState();
  const [disableReason, setDisableReason] = useState('');

  const { fetchRoomList } = useDashboard();

  const { dashboardFilter, updateDashboardFilter } = usePreferenceStore();
  const role = useUserStore((state) => state.user?.userRole ?? state.user?.role);
  const selectedSiteId = useUserStore((state) => state.selectedSiteId);
  const canManageQueue = role === 'SITE_ADMIN' || role === 'SUPER';

  const onRoomEnvironmentChange = useCallback((env) => {
    updateDashboardFilter({ roomEnvironment: env });
  }, [updateDashboardFilter]);

  // const onTagChange = (tagList) => {
  //   console.log('onTagChange', tagList);
  // };

  const handleDisableQueue = async () => {
    try {
      const me = useUserStore.getState().user;
      const siteId = getEffectiveSiteId(me, selectedSiteId);
      if (!canManageQueue || siteId == null) {
        ToastUtil.error('저장 실패', '권한이 없습니다.');
        return;
      }
      const response = await SiteClient.updateQueueEnabled(siteId, false, disableReason.trim());
      if (response.status !== 200) {
        throw new Error('failed to create room ' + JSON.stringify(response));
      }
      await fetchRoomList();
      setDisableReason('');
      ToastUtil.success('시스템 설정', '성공적으로 저장했습니다.');
    } catch (error) {
      console.error(error.response);
      ToastUtil.error('시스템 설정', error.response?.data?.detail ?? '저장에 실패했습니다.');
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
    if (action === 'disable-queue') {
      disableQueueAlertState.setOpen(true);
    }
  };

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        {/*<Popover>*/}
        {/*  <Button className="text-base">*/}
        {/*    <Funnel />*/}
        {/*    Filter*/}
        {/*  </Button>*/}
        {/*  <Popover.Content className="max-w-64" placement="bottom start">*/}
        {/*    <Popover.Dialog>*/}
        {/*      <Popover.Heading>대시보드 필터</Popover.Heading>*/}
        {/*      */}
        {/*    </Popover.Dialog>*/}
        {/*  </Popover.Content>*/}
        {/*</Popover>*/}
        <EnvironmentFilterSelect
          selectedKey={dashboardFilter?.roomEnvironment}
          onSelectionChange={onRoomEnvironmentChange}
        />

        <EnabledFilterSelect value={dashboardFilter?.enabled} onChange={updateDashboardFilter} />
      </div>

      {canManageQueue && (
        <Dropdown>
          <Button aria-label="dashboard-bar-settings" slot="trigger" variant="tertiary" className="text-base">
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
      )}

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
      {/*  <span className="text-sm text-muted font-medium">태그</span>*/}
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

      {canManageQueue && (
        <DisableQueueAlert
          isOpen={disableQueueAlertState.isOpen}
          onOpenChange={disableQueueAlertState.setOpen}
          onConfirm={handleDisableQueue}
          reason={disableReason}
          onReasonChange={setDisableReason}
        />
      )}
    </div>
  );
}
