import { Button, Input, Label, Skeleton, Switch } from '@heroui/react';
import { useEffect, useMemo, useState } from 'react';
import FormSection from '../common/FormSection.jsx';
import FieldSelect from '../common/FieldSelect.jsx';
import { AlertClient } from '../../api/alert/index.js';
import { ToastUtil } from '../../util/toastUtil.js';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges.js';

const DEFAULT_CHANNEL_CATALOG = [
  { channel: 'TEAMS', label: 'Teams' },
  { channel: 'KAKAO', label: '카카오 알림톡' },
  { channel: 'EMAIL', label: '이메일' },
];

const SUBSCRIPTION_HINT = {
  QUEUE_WAIT: {
    true: '대기인원이 기준을 넘으면 알림을 받습니다.',
    false: '대기인원 알림을 받지 않습니다.',
  },
  SITE_DISABLED: {
    true: '사이트가 비활성화되면 알림을 받습니다.',
    false: '사이트 비활성화 알림을 받지 않습니다.',
  },
  SITE_MAINTENANCE: {
    true: '사이트 점검이 시작되거나 끝나면 알림을 받습니다.',
    false: '사이트 점검 알림을 받지 않습니다.',
  },
  INFRA: {
    true: '스케줄러 중단·실패, 노드/컨테이너 장애 등 인프라 이상 알림을 받습니다.',
    false: '인프라 알림을 받지 않습니다.',
  },
};

const REMOVED_ALERTNAMES = new Set(['ACTIVE_USERS', 'VISITOR_SURGE', 'SCHEDULER_FAILED', 'SCHEDULER_STOPPED']);
const REMOVED_LABELS = new Set(['활성사용자', '접속자 급증', '스케줄러 실패', '스케줄러 중단/기동']);

function visibleSubscriptions(items) {
  return (items ?? []).filter((item) => {
    const alertname = item?.alertname;
    const label = item?.label;
    if (REMOVED_ALERTNAMES.has(alertname) || REMOVED_LABELS.has(label)) return false;
    return Boolean(SUBSCRIPTION_HINT[alertname]);
  });
}

function channelSnapshot(items) {
  return (items ?? []).map((item) => ({
    channel: item.channel ?? '',
    target: item.target ?? '',
  }));
}

function subscriptionCopy(subscription) {
  const enabled = Boolean(subscription.enabled);
  const label = subscription.label ?? subscription.alertname;
  const hint = SUBSCRIPTION_HINT[subscription.alertname]?.[enabled];
  return {
    fieldLabel: `${label} 활성/비활성화`,
    title: enabled ? `${label}` : `${label}`,
    subtitle: hint ?? (enabled ? `${label} 알림을 받습니다.` : `${label} 알림을 받지 않습니다.`),
  };
}

export default function AlertSettingsForm() {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isChannelSaving, setIsChannelSaving] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [channelTargets, setChannelTargets] = useState([]);
  const [savedChannelTargets, setSavedChannelTargets] = useState([]);
  const [channelCatalog, setChannelCatalog] = useState(DEFAULT_CHANNEL_CATALOG);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [{ data: subscriptionData }, { data: channelData }] = await Promise.all([
          AlertClient.getMySubscriptions(),
          AlertClient.getMyChannels(),
        ]);
        setSubscriptions(visibleSubscriptions(subscriptionData?.subscriptions));
        const nextTargets = channelData?.targets ?? [];
        setChannelTargets(nextTargets);
        setSavedChannelTargets(nextTargets);
        if (channelData?.catalog?.length) setChannelCatalog(channelData.catalog);
      } catch (error) {
        console.error(error);
        ToastUtil.error('알림 설정', '알림 설정을 불러오지 못했습니다.');
      } finally {
        setIsPageLoading(false);
      }
    };
    loadSettings();
  }, []);

  const channelDirty = useMemo(
    () => JSON.stringify(channelSnapshot(channelTargets)) !== JSON.stringify(channelSnapshot(savedChannelTargets)),
    [channelTargets, savedChannelTargets]
  );
  const hasSavedChannel = useMemo(
    () => savedChannelTargets.some((item) => (item.target ?? '').trim()),
    [savedChannelTargets]
  );
  useUnsavedChanges(channelDirty);

  const handleSubscriptionChange = async (alertname, enabled) => {
    if (!hasSavedChannel) return;
    const previous = subscriptions;
    const next = previous.map((item) => (item.alertname === alertname ? { ...item, enabled } : item));
    setSubscriptions(next);
    try {
      const { data } = await AlertClient.updateMySubscriptions(
        next.map((item) => ({
          alertname: item.alertname,
          enabled: Boolean(item.enabled),
        }))
      );
      const confirmed = visibleSubscriptions(data?.subscriptions ?? next);
      const previousSnapshot = JSON.stringify(next.map((item) => [item.alertname, Boolean(item.enabled)]));
      const confirmedSnapshot = JSON.stringify(confirmed.map((item) => [item.alertname, Boolean(item.enabled)]));
      if (confirmedSnapshot !== previousSnapshot) {
        setSubscriptions(confirmed);
      }
    } catch (error) {
      console.error(error);
      setSubscriptions(previous);
      ToastUtil.error('알림 수신', error?.response?.data?.detail ?? '알림 수신 설정을 저장하지 못했습니다.');
    }
  };

  const handleChannelSave = async () => {
    if (!channelDirty) {
      ToastUtil.error('알림 채널', '변경된 항목이 없습니다.');
      return;
    }
    setIsChannelSaving(true);
    try {
      const { data } = await AlertClient.updateMyChannels(
        channelTargets.map((item) => ({
          channel: item.channel,
          target: item.target,
        }))
      );
      const nextTargets = data?.targets ?? channelTargets;
      setChannelTargets(nextTargets);
      setSavedChannelTargets(nextTargets);
      if (data?.catalog?.length) setChannelCatalog(data.catalog);
      ToastUtil.success('알림 채널', '알림 채널을 저장했습니다.');
    } catch (error) {
      console.error(error);
      ToastUtil.error('알림 채널', error?.response?.data?.detail ?? '알림 채널을 저장하지 못했습니다.');
    } finally {
      setIsChannelSaving(false);
    }
  };

  return (
    <div className="relative flex w-full flex-col gap-4">
      <FormSection title="알림 채널">
        {isPageLoading ? (
          <Skeleton className="h-24 w-full max-w-2xl rounded-lg" />
        ) : (
          <div className="flex w-full max-w-2xl flex-col gap-4">
            <p className="text-sm text-muted">
              채널을 고르고 수신값을 입력합니다. Teams, 카카오 알림톡, 이메일을 여러 개 등록할 수 있습니다.
            </p>
            {channelTargets.map((row, index) => (
              <div
                key={`${row.targetId ?? 'new'}-${index}`}
                className="flex flex-col gap-2 sm:flex-row sm:items-center"
              >
                <FieldSelect
                  className="w-full sm:max-w-64"
                  aria-label="채널"
                  placeholder="채널 선택"
                  value={row.channel}
                  onChange={(channel) =>
                    setChannelTargets((current) =>
                      current.map((item, itemIndex) => (itemIndex === index ? { ...item, channel } : item))
                    )
                  }
                  options={channelCatalog.map((option) => ({
                    value: option.channel,
                    label: option.label,
                  }))}
                />
                <Input
                  className="flex-1 ring-1 focus:ring-2 ring-neutral-200 focus:ring-accent"
                  value={row.target ?? ''}
                  placeholder={
                    row.channel === 'EMAIL'
                      ? '이메일 주소'
                      : row.channel === 'KAKAO'
                        ? '알림톡 수신 번호'
                        : 'Teams 수신자 ID'
                  }
                  onChange={(event) =>
                    setChannelTargets((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, target: event.target.value } : item
                      )
                    )
                  }
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="min-h-11"
                  onPress={() => setChannelTargets((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                >
                  삭제
                </Button>
              </div>
            ))}
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="secondary"
                className="min-h-11"
                onPress={() =>
                  setChannelTargets((current) => [
                    ...current,
                    { channel: channelCatalog[0]?.channel ?? 'TEAMS', target: '' },
                  ])
                }
              >
                채널 추가
              </Button>
              <Button
                type="button"
                className="min-h-11"
                isPending={isChannelSaving}
                isDisabled={!channelDirty || isChannelSaving}
                onPress={handleChannelSave}
              >
                저장하기
              </Button>
            </div>
          </div>
        )}
      </FormSection>

      <FormSection title="알림 수신">
        {isPageLoading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-29 w-full max-w-lg rounded-lg" />
            ))}
          </div>
        ) : (
          <div className={`flex w-full max-w-lg flex-col gap-6 ${hasSavedChannel ? '' : 'opacity-60'}`}>
            <p className="text-sm text-muted">
              {hasSavedChannel ? '받고 싶은 알림 유형을 켭니다.' : '알림을 받으려면 먼저 수신 채널을 저장해 주세요.'}
            </p>
            {subscriptions.map((subscription) => {
              const copy = subscriptionCopy(subscription);
              return (
                <div key={subscription.alertname} className="flex flex-col gap-2">
                  <Label className="text-base">{copy.fieldLabel}</Label>
                  <Switch
                    isSelected={Boolean(subscription.enabled)}
                    isDisabled={!hasSavedChannel}
                    onChange={(enabled) => handleSubscriptionChange(subscription.alertname, enabled)}
                    className="group w-full max-w-lg"
                  >
                    <Switch.Content className="flex min-h-14 w-full flex-row-reverse items-center justify-between gap-2 rounded-lg border-2 border-default bg-white p-4 hover:bg-neutral-100 group-data-[selected=true]:border-accent group-data-[disabled=true]:hover:bg-white">
                      <Switch.Control>
                        <Switch.Thumb>
                          <Switch.Icon />
                        </Switch.Thumb>
                      </Switch.Control>
                      <span className="flex min-w-0 flex-col gap-1">
                        <span className="text-base">{copy.title}</span>
                        <span className="text-sm text-muted">{copy.subtitle}</span>
                      </span>
                    </Switch.Content>
                  </Switch>
                </div>
              );
            })}
          </div>
        )}
      </FormSection>
    </div>
  );
}
