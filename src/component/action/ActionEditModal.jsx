import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  addToast,
  Skeleton,
  Input,
  Form,
  RadioGroup,
  Select,
  SelectItem,
  DateRangePicker,
  useDraggable,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownItem,
  DropdownMenu,
  Autocomplete,
  AutocompleteItem,
} from '@heroui/react';
import { parseDateTime, now } from '@internationalized/date';
import { useEffect, useRef, useState } from 'react';

import SectionTitle from '../common/SectionTitle.jsx';
import ActionTypeRadio from './ActionTypeRadio.jsx';
import ActionRuleItemList from './ActionRuleItemList.jsx';
import { ActionClient } from '../../api/action/index.js';
import { ActionUtil } from '../../util/actionUtil.js';
import { ActionGroupClient } from '../../api/action-group/index.js';
import ConfirmModal from '../ConfirmModal.jsx';
import { SettingsOutlinedIcon } from '../../icon/Icons.jsx';
import ActionGroupAutoComplete from './ActionGroupAutoComplete.jsx';
import { readonlyInputProps, requiredInputProps } from '../../shared/props.js';
import { ToastUtil } from '../../util/toastUtil.js';

const DEFAULT_RULE_TYPES = [
  {
    value: 'ALL',
    name: 'ALL (기본값)',
    description: '모든 요청에 대해 대기열이 활성화됩니다.',
  },
  {
    value: 'INCLUDE',
    name: 'INCLUDE',
    description: '액션 규칙에 해당하는 경우 대기열이 활성화됩니다',
  },
  {
    value: 'EXCLUDE',
    name: 'EXCLUDE',
    description: '액션 규칙에 해당하는 경우를 제외하고 대기열이 활성화됩니다',
  },
];

function toRangedDate(landingStartAt, landingEndAt) {
  if (!landingStartAt || !landingEndAt) {
    return defaultDateRange;
  }
  return {
    start: parseDateTime(landingStartAt),
    end: parseDateTime(landingEndAt),
  };
}
const defaultDateRange = {
  start: now('Asia/Seoul'),
  end: now('Asia/Seoul').add({ days: 7 }),
};
const defaultActionRule = {
  paramName: '',
  paramValue: '',
  matchOperator: 'EQUAL',
  description: '',
};

export default function ActionEditModal({ actionId, actionGroupId, isOpen, onOpenChange, onConfirm, onCancel }) {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [action, setAction] = useState({});
  const [selectActionGroup, setSelectActionGroup] = useState({});
  const [editName, setEditName] = useState('');
  const [editActionUrl, setEditActionUrl] = useState('');
  const [editActionType, setEditActionType] = useState('DIRECT');
  const [editLandingDestinationUrl, setEditLandingDestinationUrl] = useState('');
  const [editLandingDateRange, setEditLandingDateRange] = useState(defaultDateRange);
  const [selectDefaultRuleType, setSelectDefaultRuleType] = useState('');
  const [editActionRules, setEditActionRules] = useState([{ ...defaultActionRule }]);

  const targetRef = useRef(null);
  const formRef = useRef(null);
  const { moveProps } = useDraggable({ targetRef, isDisabled: !isOpen });

  const handleChangeActionRule = (idx, field, value) => {
    const newRules = editActionRules.map((rule, i) => (i === idx ? { ...rule, [field]: value } : rule));
    setEditActionRules(newRules);
  };

  const handleAddActionRule = () => {
    const newRules = [...editActionRules, { ...defaultActionRule }];
    setEditActionRules(newRules);
  };

  const handleRemoveRule = (index) => {
    const newRules = editActionRules.filter((rule, i) => i !== index);
    setEditActionRules(newRules);
  };

  // actionId가 바뀔 때 마다 다시 fetch
  useEffect(() => {
    if (actionId == null) {
      setAction(null);
      clearForm();
      setIsPageLoading(false);
      return;
    }
    fetchAction();
  }, [actionId]);

  useEffect(() => {
    if (action == null || action.name == null) {
      return;
    }
    initializeEdits();
  }, [action]);

  const {
    isOpen: isOpenMoveActionGroupModal,
    onOpen: onOpenMoveActionGroupModal,
    onOpenChange: onOpenChangeMoveActionGroupModal,
    onClose: onCloseMoveActionGroupModal,
  } = useDisclosure();

  const {
    isOpen: isOpenDeleteActionModal,
    onOpen: onOpenDeleteActionModal,
    onOpenChange: onOpenChangeDeleteActionModal,
    onClose: onCloseDeleteActionModal,
  } = useDisclosure();

  const fetchAction = () => {
    setIsPageLoading(true);

    ActionClient.getActionById(actionId)
      .then(
        (res) => {
          setAction(res.data);
        },
        (error) => {
          console.error('Failed to fetch action', error);
          addToast({
            title: '이벤트 상세',
            description: '액션을 불러오는데에 실패했습니다.',
            color: 'danger',
          });
        }
      )
      .finally(() => {
        setIsPageLoading(false);
      });
  };

  const clearForm = () => {
    setEditName('');
    setSelectActionGroup({});
    setEditActionUrl('');
    setEditActionType('');
    setEditLandingDestinationUrl('');
    setSelectDefaultRuleType('ALL');
    setEditActionRules([{ ...defaultActionRule }]);
    setEditLandingDateRange(defaultDateRange);
  };

  const handleSelectDefaultRuleTypeChange = (e) => {
    setSelectDefaultRuleType(e.target.value);
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitLoading(true);

    const startDate = editLandingDateRange.start.toDate(); // toISOString은 9시간 시차가 발생하여 수동으로 맞춰줌.
    const endDate = editLandingDateRange.end.toDate();

    const data = {
      name: editName,
      actionUrl: editActionUrl,
      actionType: editActionType,
      landingStartAt: startDate,
      landingEndAt: endDate,
      landingDestinationUrl: editLandingDestinationUrl,
      defaultRuleType: selectDefaultRuleType,
      actionRules: editActionRules,
    };

    try {
      if (actionId) {
        await ActionClient.updateActionById(actionId, data);
        await ActionClient.invalidateCoreActionCache(actionId);
      } else {
        await ActionGroupClient.createAction(actionGroupId, data);
      }
      addToast({
        title: '액션',
        description: '성공적으로 저장했습니다.',
        color: 'success',
      });
      await onConfirm();
    } catch (error) {
      console.error(error);
      addToast({
        title: '이벤트 상세',
        description: '저장에 실패했습니다.',
        color: 'danger',
      });
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const initializeEdits = () => {
    setEditName(action.name);
    setSelectActionGroup({
      actionGroupId: action.actionGroupId,
      name: action.actionGroupName,
      description: action.actionGroupDescription,
    });
    setEditActionUrl(action.actionUrl);
    setEditActionType(action.actionType);
    setEditLandingDestinationUrl(action.landingDestinationUrl || '');
    setSelectDefaultRuleType(action.defaultRuleType);
    setEditActionRules(action.actionRules);
    setEditLandingDateRange(toRangedDate(action.landingStartAt, action.landingEndAt));
  };

  const handleDeleteAction = async () => {
    try {
      await ActionClient.deleteActionById(actionId);
      await ActionClient.invalidateCoreActionCache(actionId);
      ToastUtil.success('액션 삭제', '액션을 삭제했습니다.');
      await onCloseDeleteActionModal();
      await onConfirm();
    } catch (error) {
      console.error(error);
      ToastUtil.error('오류', '액션 삭제를 실패했습니다.');
    } finally {
      setIsSubmitLoading(false);
    }
  };
  return (
    <Modal
      isDismissable={false}
      isKeyboardDismissDisabled={true}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="4xl"
      scrollBehavior="inside"
      ref={targetRef}
    >
      <ModalContent className="bg-neutral-50">
        <>
          <ModalHeader {...moveProps} className="flex flex-col">
            <div className="flex justify-between items-center">
              <div className="flex justify-between items-center gap-2">
                <span>{actionId ? '액션 편집' : '액션 생성'}</span>
                <Dropdown>
                  <DropdownTrigger>
                    <Button size="sm" variant="light" isIconOnly>
                      <SettingsOutlinedIcon size={28} />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Static Actions">
                    <DropdownItem onPress={onOpenDeleteActionModal} key="delete" className="text-danger" color="danger">
                      액션 삭제
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
              {/*<div className="mr-3">*/}
              {/*  <Button size="sm" isIconOnly onPress={onCancel} variant="light">*/}
              {/*    X*/}
              {/*  </Button>*/}
              {/*</div>*/}
            </div>
          </ModalHeader>
          <ModalBody>
            <Form
              className="w-full flex flex-col"
              // onReset={() => setAction('reset')}
              ref={formRef}
              onSubmit={handleSubmit}
            >
              <div className="relative w-full flex flex-col gap-6">
                <SectionTitle title="기본 설정" first>
                  <Skeleton className="rounded-lg w-full" isLoaded={!isPageLoading}>
                    <div className="flex flex-col w-full gap-6">
                      {actionId != null && (
                        <Input
                          className="w-full max-w-2xl"
                          label="ID"
                          placeholder="액션 ID"
                          name="id"
                          description="액션의 고유한 ID 입니다."
                          type="text"
                          value={actionId}
                          {...readonlyInputProps}
                        />
                      )}
                      <Input
                        className="w-full max-w-2xl"
                        label="액션 이름"
                        placeholder="액션의 이름을 입력해주세요."
                        name="name"
                        description="액션의 이름 입니다."
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        {...requiredInputProps}
                      />
                      {actionId != null && (
                        <div className="flex gap-2 items-center">
                          <Input
                            className="w-full max-w-[15rem]"
                            classNames={{
                              inputWrapper: 'hover:bg-red-200 focus:none',
                            }}
                            label="액션 그룹 ID"
                            name="actionGroupId"
                            description="액션이 속한 액션 그룹 입니다."
                            type="text"
                            value={`${action?.actionGroupId} (${action?.actionGroupName})`}
                            {...readonlyInputProps}
                          />

                          <Button size="lg" color="primary" variant="bordered">
                            변경하기
                          </Button>
                        </div>
                      )}
                      {/*<ActionGroupAutoComplete action={action} />*/}
                    </div>
                  </Skeleton>
                </SectionTitle>
                {/*<Skeleton className="rounded-lg w-full" isLoaded={!isEventLoading}></Skeleton>*/}
                <SectionTitle title="유량 제어">
                  <Skeleton className="rounded-lg w-full" isLoaded={!isPageLoading}>
                    <div className="w-full flex flex-col gap-6">
                      <div id="action-type-radio-group">
                        <div className="mb-2 text-base after:content-['*'] after:text-danger after:ms-0.5">
                          액션 유형
                        </div>
                        <RadioGroup
                          value={editActionType}
                          isRequired
                          errorMessage="다음 옵션 중 하나를 선택하세요."
                          onValueChange={setEditActionType}
                          orientation="horizontal"
                          classNames={{
                            wrapper: 'flex',
                          }}
                        >
                          <ActionTypeRadio description="고객이 더현대닷컴에 접근합니다." value="DIRECT">
                            Direct
                          </ActionTypeRadio>
                          <ActionTypeRadio description="고객이 대기열로 직접 접속합니다." value="LANDING">
                            Landing
                          </ActionTypeRadio>
                        </RadioGroup>
                      </div>
                      {editActionType === 'DIRECT' && (
                        <Input
                          className="w-full max-w-2xl"
                          label="액션 URL"
                          placeholder="https://www.example.com"
                          name="name"
                          description="액션 URL 입니다. 이 URL로 입장한 경우 대기열이 적용됩니다."
                          type="text"
                          value={editActionUrl}
                          onChange={(e) => setEditActionUrl(e.target.value)}
                          {...requiredInputProps}
                        />
                      )}
                      {editActionType === 'LANDING' && actionId != null && (
                        <div className="flex gap-4 w-full max-w-2xl">
                          <Input
                            className="max-w-[12rem]"
                            label="랜딩 ID"
                            placeholder="랜딩 ID"
                            name="landingId"
                            description="고유한 랜딩 ID 입니다."
                            value={action?.landingId}
                            type="text"
                            {...readonlyInputProps}
                          />
                          <Input
                            className="w-full max-w-2xl"
                            label="랜딩 URL"
                            placeholder="랜딩 URL"
                            name="landingId"
                            description="액션 유형이 랜딩인 경우, 고객은 이 ID를 기준으로 대기열에 입장하게 됩니다."
                            type="text"
                            value={ActionUtil.getActionUrl(editActionType, action)}
                            {...readonlyInputProps}
                          />
                        </div>
                      )}
                      {editActionType === 'LANDING' && (
                        <>
                          <Input
                            className="w-full max-w-2xl"
                            label="랜딩 목적지 URL"
                            placeholder="https://www.example.com"
                            name="landingDestinationUrl"
                            description="대기가 끝나면 이 URL로 이동하게 됩니다."
                            type="text"
                            value={editLandingDestinationUrl}
                            onChange={(e) => setEditLandingDestinationUrl(e.target.value)}
                            {...requiredInputProps}
                          />
                          <DateRangePicker
                            className="w-full max-w-sm"
                            radius="md"
                            hideTimeZone
                            granularity="minute"
                            label="랜딩페이지 입장 기간"
                            variant="bordered"
                            visibleMonths={2}
                            aria-label="랜딩페이지 입장 캘린더"
                            description="랜딩페이지 입장 시작시간과 종료시간을 입력해주세요."
                            hourCycle={24}
                            value={editLandingDateRange}
                            onChange={setEditLandingDateRange}
                            fullWidth={false}
                            {...requiredInputProps}
                          />
                        </>
                      )}
                    </div>
                  </Skeleton>
                </SectionTitle>
                <SectionTitle title="대기열 적용 규칙">
                  <Skeleton className="rounded-lg w-full" isLoaded={!isPageLoading}>
                    <div className="w-full flex flex-col gap-6">
                      {/*<div id="action-type-radio-group">*/}
                      {/*  <div className="mb-2 text-sm after:content-['*'] after:text-danger after:ms-0.5">*/}
                      {/*    대기열 적용 규칙*/}
                      {/*  </div>*/}
                      {/*  <RadioGroup*/}
                      {/*    size="sm"*/}
                      {/*    value={selectDefaultRuleType}*/}
                      {/*    onValueChange={setSelectDefaultRuleType}*/}
                      {/*    orientation="horizontal"*/}
                      {/*    classNames={{*/}
                      {/*      wrapper: 'w-[50rem] flex',*/}
                      {/*    }}*/}
                      {/*  >*/}
                      {/*    {defaultActionRuleTypes.map((ruleType) => (*/}
                      {/*      <ActionTypeRadio size="w-[16rem]" description={ruleType.description} value={ruleType.value}>*/}
                      {/*        {ruleType.name}*/}
                      {/*      </ActionTypeRadio>*/}
                      {/*    ))}*/}
                      {/*  </RadioGroup>*/}
                      {/*</div>*/}
                      <Select
                        className="max-w-[20rem]"
                        items={DEFAULT_RULE_TYPES}
                        label="대기열 적용 규칙 유형"
                        selectedKeys={[selectDefaultRuleType]}
                        onChange={handleSelectDefaultRuleTypeChange}
                        description={DEFAULT_RULE_TYPES.filter((t) => t.value === selectDefaultRuleType).map(
                          (v) => v.description
                        )}
                        popoverProps={{
                          classNames: {
                            content: 'w-96',
                          },
                        }}
                        {...requiredInputProps}
                      >
                        {(defaultType) => (
                          <SelectItem key={defaultType.value} textValue={defaultType.name}>
                            <div className="flex gap-2 items-center">
                              <div className="flex flex-col">
                                <span className="text-small">{defaultType.name}</span>
                                <span className="text-tiny text-default-400">{defaultType.description}</span>
                              </div>
                            </div>
                          </SelectItem>
                        )}
                      </Select>

                      {(selectDefaultRuleType === 'INCLUDE' || selectDefaultRuleType === 'EXCLUDE') && (
                        <div id="action-rules">
                          <div className="mb-2 text-sm">대기열 적용 규칙</div>
                          <ActionRuleItemList
                            rules={editActionRules}
                            onChange={handleChangeActionRule}
                            onAdd={handleAddActionRule}
                            onDelete={handleRemoveRule}
                          />
                        </div>
                      )}
                    </div>
                  </Skeleton>
                </SectionTitle>
              </div>

              <div className="bottom-[-8px] sticky w-full bg-neutral-50 rounded-r-xl z-20 h-[56px] pt-1">
                <div className="flex gap-1 justify-end">
                  <Button size="lg" color="danger" variant="light" onPress={onCancel}>
                    취소하기
                  </Button>
                  <Button size="lg" color="primary" type="submit" isLoading={isSubmitLoading}>
                    저장하기
                  </Button>
                </div>
              </div>
            </Form>
            <ConfirmModal
              isOpen={isOpenMoveActionGroupModal}
              onOpenChange={onOpenChangeMoveActionGroupModal}
              onCancel={onCloseMoveActionGroupModal}
              onConfirm
              title="액션 그룹 이동"
              message="정말로 이 액션을 다른 그룹으로 이동하시겠습니까?"
            />

            <ConfirmModal
              isOpen={isOpenDeleteActionModal}
              onOpenChange={onOpenChangeDeleteActionModal}
              onCancel={onCloseDeleteActionModal}
              onConfirm={handleDeleteAction}
              title="액션 그룹 삭제"
              message={
                <div className="flex flex-col">
                  <span>정말로 액션을 삭제하시겠습니까?</span>
                  <span>삭제한 뒤에는 다시 복구할 수 없습니다.</span>
                </div>
              }
            />
          </ModalBody>
          <ModalFooter className="pb-0">
            {/*<Button color="danger" variant="light" onPress={onCancel}>*/}
            {/*  취소하기*/}
            {/*</Button>*/}
            {/*<Button color="primary" onPress={externalSubmit} isLoading={isSubmitLoading}>*/}
            {/*  저장하기*/}
            {/*</Button>*/}
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
}
