import { Button, Form, Input, Skeleton } from '@heroui/react';
import SectionTitle from '../common/SectionTitle.jsx';
import { optionalInputProps } from '../../shared/props.js';
import { EyeFilledIcon, EyeSlashFilledIcon } from '../../icon/Icons.jsx';
import { useState } from 'react';

export default function UserManagementForm() {
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
            <div className="flex justify-between items-center">{/*  TODO 섹션 나누기 또는 설정화면 분리하기 */}</div>
          </div>
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
