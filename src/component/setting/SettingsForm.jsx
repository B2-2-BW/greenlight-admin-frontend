import { Button, cn, Form, Input, NumberInput, Skeleton, Switch, Tooltip } from '@heroui/react';
import DeleteSvg from '../../icon/Delete.jsx';
import ArrowBackSvg from '../../icon/ArrowBackSvg.jsx';
import ActionGroupStatusChip from '../action-group/ActionGroupStatusChip.jsx';
import SectionTitle from '../common/SectionTitle.jsx';
import { optionalInputProps, readonlyInputProps, requiredInputProps } from '../../shared/props.js';
import { EyeFilledIcon, EyeSlashFilledIcon, PlusIcon } from '../../icon/Icons.jsx';
import ActionListTable from '../action/ActionListTable.jsx';
import ConfirmModal from '../ConfirmModal.jsx';
import ActionEditModal from '../action/ActionEditModal.jsx';
import { useEffect, useState } from 'react';

export default function SettingsForm() {
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [editUsername, setEditUsername] = useState();

  const [isVisibleCurrentPassword, setIsVisibleCurrentPassword] = useState(false);
  const [isVisibleNewPassword, setIsVisibleNewPassword] = useState(false);
  const [isVisibleNewPasswordConfirm, setIsVisibleNewPasswordConfirm] = useState(false);

  const handleSubmit = () => {};
  return (
    <>
      <Form
        className="w-full flex flex-col"
        // onReset={() => setAction('reset')}
        onSubmit={handleSubmit}
      >
        <div className="relative w-full flex flex-col gap-4">
          <div className="w-full">
            <div className="flex justify-between items-center">
              <div className="text-sm text-default-400 mb-1">내 계정</div>
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
            {/*    {<ActionGroupStatusChip enabled={actionGroup?.enabled} />}*/}
            {/*  </div>*/}
            {/*</Skeleton>*/}
          </div>
          <SectionTitle title="비밀번호 변경">
            <Skeleton className="rounded-lg w-full" isLoaded={!isPageLoading}>
              <div className="flex flex-col w-full gap-6">
                <Input
                  className="w-full max-w-md"
                  label="비밀번호"
                  placeholder="비밀번호를 입력하세요."
                  name="name"
                  endContent={
                    <button
                      aria-label="toggle password visibility"
                      className="focus:outline-hidden"
                      type="button"
                      onClick={() => setIsVisibleCurrentPassword(!isVisibleCurrentPassword)}
                    >
                      {isVisibleCurrentPassword ? (
                        <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                      ) : (
                        <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                      )}
                    </button>
                  }
                  type={isVisibleCurrentPassword ? 'text' : 'password'}
                  {...optionalInputProps}
                />
                <Input
                  className="w-full max-w-md"
                  label="새 비밀번호"
                  placeholder="새 비밀번호를 입력하세요."
                  name="name"
                  endContent={
                    <button
                      aria-label="toggle password visibility"
                      className="focus:outline-hidden"
                      type="button"
                      onClick={() => setIsVisibleNewPassword(!isVisibleNewPassword)}
                    >
                      {isVisibleNewPassword ? (
                        <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                      ) : (
                        <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                      )}
                    </button>
                  }
                  type={isVisibleNewPassword ? 'text' : 'password'}
                  {...optionalInputProps}
                />
                <Input
                  className="w-full max-w-md"
                  label="새 비밀번호 확인"
                  placeholder="새 비밀번호를 확인해주세요."
                  name="name"
                  endContent={
                    <button
                      aria-label="toggle password visibility"
                      className="focus:outline-hidden"
                      type="button"
                      onClick={() => setIsVisibleNewPasswordConfirm(!isVisibleNewPasswordConfirm)}
                    >
                      {isVisibleNewPasswordConfirm ? (
                        <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                      ) : (
                        <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                      )}
                    </button>
                  }
                  type={isVisibleNewPasswordConfirm ? 'text' : 'password'}
                  {...optionalInputProps}
                />
              </div>
            </Skeleton>
          </SectionTitle>
          <div className="w-full">
            <div className="flex justify-between items-center">
              {/*  TODO 섹션 나누기 또는 설정화면 분리하기 */}
              <div className="text-sm text-default-400 mb-1">시스템 관리</div>
            </div>
          </div>
          {/*<Skeleton className="rounded-lg w-full" isLoaded={!isEventLoading}></Skeleton>*/}
          <SectionTitle title="대기열 관리">
            <Skeleton className="rounded-lg w-full" isLoaded={!isPageLoading}>
              <div className="flex flex-col w-full gap-6">
                <div>
                  <div className="mb-2 text-base after:content-['*'] after:text-danger after:ms-0.5">
                    대기열 활성/비활성화
                  </div>

                  {/*<Switch*/}
                  {/*  isSelected={editEnabled}*/}
                  {/*  onValueChange={setEditEnabled}*/}
                  {/*  classNames={{*/}
                  {/*    base: cn(*/}
                  {/*      'inline-flex flex-row-reverse w-full max-w-md bg-content1 hover:bg-content2 items-center',*/}
                  {/*      'justify-between cursor-pointer rounded-lg gap-2 p-4 border-2 border-default',*/}
                  {/*      'data-[selected=true]:border-primary'*/}
                  {/*    ),*/}
                  {/*    wrapper: 'p-0 h-4 overflow-visible',*/}
                  {/*    thumb: cn(*/}
                  {/*      'w-6 h-6 border-2 shadow-lg',*/}
                  {/*      'group-data-[hover=true]:border-primary',*/}
                  {/*      //selected*/}
                  {/*      'group-data-[selected=true]:ms-6',*/}
                  {/*      // pressed*/}
                  {/*      'group-data-[pressed=true]:w-7',*/}
                  {/*      'group-data-pressed:group-data-selected:ms-4'*/}
                  {/*    ),*/}
                  {/*  }}*/}
                  {/*>*/}
                  {/*  <div className="flex flex-col gap-1">*/}
                  {/*    <p className="text-base">{enabledMessage[editEnabled]?.title}</p>*/}
                  {/*    <p className="text-sm text-default-400">{enabledMessage[editEnabled]?.subtitle}</p>*/}
                  {/*  </div>*/}
                  {/*</Switch>*/}
                </div>
              </div>
            </Skeleton>
          </SectionTitle>
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
