import { Button, Form, cn, Input, Skeleton, Switch } from '@heroui/react';
import SectionTitle from '../common/SectionTitle.jsx';
import { optionalInputProps, readonlyInputProps, requiredInputProps } from '../../shared/props.js';
import { EyeFilledIcon, EyeSlashFilledIcon } from '../../icon/Icons.jsx';
import { useEffect, useState } from 'react';
import { RoomClient } from '../../api/room/index.js';
import { SiteClient } from '../../api/site/index.js';
import { useUserStore } from '../../store/user.jsx';
import { ToastUtil } from '../../util/toastUtil.js';

const enabledMessage = {
  true: {
    title: '대기열 시스템 활성화',
    subtitle: '대기열 시스템이 활성화되어 활성사용자 수를 제어합니다.',
  },
  false: {
    title: '대기열 시스템 비활성화',
    subtitle: '대기열 시스템이 비활성화되어, 즉시 진입이 가능한 상태가 됩니다',
  },
};

export default function SiteSettingsForm() {
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [siteInfo, setSiteInfo] = useState({});

  const [editSiteEnabled, setEditSiteEnabled] = useState(true);

  const fetchSiteInfo = async () => {
    setIsPageLoading(true);
    // clearForm();

    try {
      const me = useUserStore.getState().user;
      const res = await SiteClient.findSite(me.siteId);
      const data = res.data;
      setSiteInfo(data);
      setEditSiteEnabled(data?.siteEnabled);
    } catch (error) {
      console.error('Error fetching siteInfo:', error);
    } finally {
      setIsPageLoading(false);
    }
  };

  // Location 이동 시 실행
  useEffect(() => {
    fetchSiteInfo();
  }, []);

  const reloadForm = () => {
    setEditSiteEnabled(siteInfo?.siteEnabled);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitLoading(true);
    const data = {
      siteEnabled: editSiteEnabled,
    };

    try {
      // 없는 경우 생성 화면
      const response = await SiteClient.updateSiteInfo(siteInfo.siteId, data);
      if (response.status !== 200) {
        throw new Error('failed to create room ' + JSON.stringify(response));
      }
      ToastUtil.success('시스템 설정', '성공적으로 저장했습니다.');
    } catch (error) {
      console.error(error.response);
      ToastUtil.error('시스템 설정', '저장에 실패했습니다.');
      reloadForm();
    } finally {
      setIsSubmitLoading(false);
    }
  };

  return (
    <>
      <Form className="w-full flex flex-col" onSubmit={handleSubmit}>
        <div className="relative w-full flex flex-col gap-4">
          <div className="w-full">
            <div className="flex justify-between items-center">
              <div className="flex flex-row gap-6">
                {/*<Tooltip content="뒤로가기">*/}
                {/*  <Button size="sm" isIconOnly variant="light" onPress={onPressBack}>*/}
                {/*    <ArrowBackSvg />*/}
                {/*  </Button>*/}
                {/*</Tooltip>*/}
              </div>
            </div>
            {/*<Skeleton className="rounded-lg w-full h-10" isLoaded={!isPageLoading}>*/}
            {/*  <div className="flex items-baseline gap-2">*/}
            {/*    <div className="font-bold text-3xl">액션 그룹 {actionGroupId == null ? '생성' : '상세'}</div>*/}
            {/*    {<RoomStatusChip enabled={actionGroup?.enabled} />}*/}
            {/*  </div>*/}
            {/*</Skeleton>*/}
          </div>
          <SectionTitle title="사이트 정보">
            <Skeleton className="" isLoaded={!isPageLoading}>
              <div className="flex flex-col w-full gap-6">
                <Input
                  className="w-full max-w-md"
                  label="사이트 ID"
                  name="siteId"
                  type="text"
                  value={siteInfo?.siteId}
                  {...readonlyInputProps}
                />
                <Input
                  className="w-full max-w-md"
                  label="사이트명"
                  name="siteName"
                  type="text"
                  value={siteInfo?.siteName}
                  {...readonlyInputProps}
                />
              </div>
            </Skeleton>
          </SectionTitle>
          <SectionTitle title="대기열 관리">
            <Skeleton className="rounded-lg w-full" isLoaded={!isPageLoading}>
              <div className="flex flex-col w-full gap-6">
                <div>
                  <div className="mb-2 text-base after:content-['*'] after:text-danger after:ms-0.5">
                    대기열 시스템 활성/비활성화
                  </div>

                  <Switch
                    isSelected={editSiteEnabled}
                    onValueChange={setEditSiteEnabled}
                    classNames={{
                      base: cn(
                        'inline-flex flex-row-reverse w-full max-w-md bg-content1 hover:bg-content2 items-center',
                        'justify-between cursor-pointer rounded-lg gap-2 p-4 border-2 border-default',
                        'data-[selected=true]:border-primary'
                      ),
                      wrapper: 'p-0 h-4 overflow-visible',
                      thumb: cn(
                        'w-6 h-6 border-2 shadow-lg',
                        'group-data-[hover=true]:border-primary',
                        //selected
                        'group-data-[selected=true]:ms-6',
                        // pressed
                        'group-data-[pressed=true]:w-7',
                        'group-data-selected:group-data-pressed:ms-4'
                      ),
                    }}
                  >
                    <div className="flex flex-col gap-1">
                      <p className="text-base">{enabledMessage[editSiteEnabled]?.title}</p>
                      <p className="text-sm text-default-400">{enabledMessage[editSiteEnabled]?.subtitle}</p>
                    </div>
                  </Switch>
                </div>
              </div>
            </Skeleton>
          </SectionTitle>

          {/*<SectionTitle title="활성사용자/세션 유지시간">*/}
          {/*  <Skeleton className="rounded-lg w-full" isLoaded={!isPageLoading}>*/}
          {/*    <div className="flex flex-col w-full gap-6">*/}
          {/*      <div>*/}
          {/*        <div className="mb-2 text-base after:content-['*'] after:text-danger after:ms-0.5">*/}
          {/*          대기열 시스템 활성/비활성화*/}
          {/*        </div>*/}
          {/*      </div>*/}
          {/*    </div>*/}
          {/*  </Skeleton>*/}
          {/*</SectionTitle>*/}
        </div>
        <div className="bottom-2 sticky mt-4 w-full bg-white rounded-xl z-20">
          <Button size="lg" color="primary" variant="shadow" type="submit" isLoading={isSubmitLoading} fullWidth>
            저장하기
          </Button>
        </div>
      </Form>

      {/*<ConfirmModal*/}
      {/*  isOpen={isOpenConfirm}*/}
      {/*  onOpenChange={onOpenChangeConfirm}*/}
      {/*  title="액션 그룹 삭제"*/}
      {/*  message="정말로 이 액션 그룹을 삭제하시겠습니까?"*/}
      {/*  onConfirm={handleDeleteConfirmed}*/}
      {/*  onCancel={onCloseConfirm}*/}
      {/*/>*/}
    </>
  );
}
