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
} from '@heroui/react';
import { parseDateTime, now } from '@internationalized/date';
import { useEffect, useRef, useState } from 'react';
import { getActionById } from '../../api/action/index.js';
import SectionTitle from '../common/SectionTitle.jsx';
import ActionTypeRadio from './ActionTypeRadio.jsx';
import ActionRuleItemList from './ActionRuleItemList.jsx';

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
export default function ActionEditModal({ actionId, isOpen, onOpenChange, onConfirm, onCancel }) {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [action, setAction] = useState({});

  const [editName, setEditName] = useState('');
  const [editActionUrl, setEditActionUrl] = useState('');
  const [editActionType, setEditActionType] = useState('DIRECT');
  const [editLandingDestinationUrl, setEditLandingDestinationUrl] = useState('');
  const [editLandingDateRange, setEditLandingDateRange] = useState(defaultDateRange);
  const [selectDefaultRuleType, setSelectDefaultRuleType] = useState('');
  const [editActionRules, setEditActionRules] = useState([
    {
      paramName: '',
      paramValue: '',
      matchOperator: 'EQUAL',
      description: '',
    },
  ]);

  const handleChangeActionRule = (idx, field, value) => {
    const newRules = editActionRules.map((rule, i) => (i === idx ? { ...rule, [field]: value } : rule));
    setEditActionRules(newRules);
  };

  const handleAddActionRule = () => {
    const newRules = [
      ...editActionRules,
      {
        paramName: '',
        paramValue: '',
        matchOperator: 'EQUAL',
        description: '',
      },
    ];
    setEditActionRules(newRules);
  };

  const handleRemoveRule = (index) => {
    const newRules = editActionRules.filter((rule, i) => i !== index);
    setEditActionRules(newRules);
  };

  const formRef = useRef(null);

  useEffect(() => {
    if (actionId == null) {
      setAction(null);
      clearEdit();
      setIsPageLoading(false);
      return;
    }
    getActionById(actionId)
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
  }, [actionId]);

  const clearEdit = () => {
    setEditName('');
    setEditActionUrl('');
    setEditActionType('');
    setEditLandingDestinationUrl('');
    setSelectDefaultRuleType('');
    setEditActionRules([
      {
        paramName: '',
        paramValue: '',
        matchOperator: 'EQUAL',
        description: '',
      },
    ]);
    setEditLandingDateRange(defaultDateRange);
  };

  const handleSelectDefaultRuleTypeChange = (e) => {
    setSelectDefaultRuleType(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitLoading(true);
    alert('저장!');
    setIsSubmitLoading(false);
  };

  // form 외부에서 submit을 호출하는 함수
  const externalSubmit = () => {
    if (formRef.current) {
      formRef.current.dispatchEvent(new CustomEvent('submit', { cancelable: true, bubbles: true }));
    }
  };

  const getActionUrl = () => {
    if (action == null) {
      return '';
    } else if (action.actionType === 'LANDING') {
      return `/land/${action.landingId}`;
    } else {
      return action.actionUrl;
    }
  };

  const initializeEdits = () => {
    setEditName(action.name);
    setEditActionUrl(action.actionUrl);
    setEditActionType(action.actionType);
    setEditLandingDestinationUrl(action.landingDestinationUrl || '');
    setSelectDefaultRuleType(action.defaultRuleType);
    setEditActionRules(action.actionRules);
    setEditLandingDateRange(toRangedDate(action.landingStartAt, action.landingEndAt));
  };

  useEffect(() => {
    if (action == null || action.name == null) {
      return;
    }
    initializeEdits();
  }, [action]);

  return (
    <Modal
      isDismissable={false}
      isKeyboardDismissDisabled={true}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="4xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col">액션 편집</ModalHeader>
          <ModalBody>
            <Form
              className="w-full flex flex-col"
              // onReset={() => setAction('reset')}
              ref={formRef}
              onSubmit={handleSubmit}
            >
              <div className="relative w-full flex flex-col gap-4">
                <SectionTitle title="기본 설정" first>
                  <Skeleton className="rounded-lg w-full" isLoaded={!isPageLoading}>
                    <div className="flex flex-col w-full gap-4">
                      {actionId != null && (
                        <Input
                          className="w-full max-w-2xl"
                          label="ID"
                          labelPlacement="outside"
                          placeholder="액션 ID"
                          name="id"
                          description="액션의 고유한 ID 입니다."
                          readOnly
                          type="text"
                          value={actionId}
                        />
                      )}
                      <Input
                        className="w-full max-w-2xl"
                        isRequired
                        errorMessage="필수 항목을 입력해 주세요."
                        label="액션 이름"
                        variant="bordered"
                        labelPlacement="outside"
                        placeholder="액션의 이름을 입력해주세요."
                        name="name"
                        description="액션의 이름 입니다."
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </div>
                  </Skeleton>
                </SectionTitle>
                {/*<Skeleton className="rounded-lg w-full" isLoaded={!isEventLoading}></Skeleton>*/}
                <SectionTitle title="유량 제어">
                  <Skeleton className="rounded-lg w-full" isLoaded={!isPageLoading}>
                    <div className="w-full flex flex-col gap-4">
                      <div id="action-type-radio-group">
                        <div className="mb-2 text-sm after:content-['*'] after:text-danger after:ms-0.5">액션 유형</div>
                        <RadioGroup
                          size="sm"
                          value={editActionType}
                          onValueChange={setEditActionType}
                          orientation="horizontal"
                          classNames={{
                            wrapper: 'w-[32rem] flex',
                          }}
                        >
                          <ActionTypeRadio size="max-w-lg" description="고객이 더현대닷컴에 접근합니다." value="DIRECT">
                            Direct
                          </ActionTypeRadio>
                          <ActionTypeRadio
                            size="max-w-lg"
                            description="고객이 대기열로 직접 접속합니다."
                            value="LANDING"
                          >
                            Landing
                          </ActionTypeRadio>
                        </RadioGroup>
                      </div>
                      {editActionType === 'DIRECT' && (
                        <Input
                          className="w-full max-w-2xl"
                          isRequired
                          variant="bordered"
                          errorMessage="필수 항목을 입력해 주세요."
                          label="액션 URL"
                          labelPlacement="outside"
                          placeholder="https://www.example.com"
                          name="name"
                          description="액션 URL 입니다. 이 URL로 입장한 경우 대기열이 적용됩니다."
                          type="text"
                          value={editActionUrl}
                          onChange={(e) => setEditActionUrl(e.target.value)}
                        />
                      )}
                      {editActionType === 'LANDING' && actionId != null && (
                        <Input
                          className="w-full max-w-2xl"
                          label="랜딩 ID"
                          labelPlacement="outside"
                          placeholder="랜딩 ID"
                          variant="bordered"
                          name="landingId"
                          description="고유한 랜딩 ID 입니다. 액션 유형이 랜딩인 경우, 고객은 이 ID를 기준으로 대기열에 입장하게 됩니다."
                          readOnly
                          disabled
                          type="text"
                          value={action?.landingId}
                        />
                      )}
                      {editActionType === 'LANDING' && (
                        <>
                          <Input
                            className="w-full max-w-2xl"
                            isRequired
                            errorMessage="필수 항목을 입력해 주세요."
                            variant="bordered"
                            label="랜딩 목적지 URL"
                            labelPlacement="outside"
                            placeholder="https://www.example.com"
                            name="landingDestinationUrl"
                            description="대기가 끝나면 이 URL로 이동하게 됩니다."
                            type="text"
                            value={editLandingDestinationUrl}
                            onChange={(e) => setEditLandingDestinationUrl(e.target.value)}
                          />
                          <DateRangePicker
                            isRequired
                            variant="flat"
                            size="md"
                            radius="md"
                            hideTimeZone
                            granularity="minute"
                            label="랜딩페이지 입장 기간"
                            labelPlacement="outside"
                            visibleMonths={2}
                            aria-label="랜딩페이지 입장 캘린더"
                            description="랜딩페이지 입장 시작시간과 종료시간을 입력해주세요."
                            hourCycle={24}
                            value={editLandingDateRange}
                            onChange={setEditLandingDateRange}
                            fullWidth={false}
                          />
                        </>
                      )}
                    </div>
                  </Skeleton>
                </SectionTitle>
                <SectionTitle title="대기열 적용 규칙">
                  <Skeleton className="rounded-lg w-full" isLoaded={!isPageLoading}>
                    <div className="w-full flex flex-col gap-4">
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
                        classNames={{
                          trigger: 'max-w-[10rem]',
                        }}
                        items={DEFAULT_RULE_TYPES}
                        label="대기열 적용 규칙 유형"
                        variant="bordered"
                        isRequired
                        labelPlacement="outside"
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

                      {selectDefaultRuleType !== 'ALL' && (
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

              <div className="bottom-[-20px] sticky w-full bg-white rounded-r-xl z-20 h-[52px]">
                <div className="flex gap-1 justify-end">
                  <Button color="danger" variant="light" onPress={onCancel}>
                    취소하기
                  </Button>
                  <Button color="primary" type="submit" isLoading={isSubmitLoading}>
                    저장하기
                  </Button>
                </div>
              </div>
            </Form>
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
