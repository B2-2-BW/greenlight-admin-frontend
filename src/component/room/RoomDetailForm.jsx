import {
  Button,
  cn,
  Description,
  FieldError,
  Form,
  Input,
  Label,
  ListBox,
  NumberField,
  Radio,
  RadioGroup,
  Select,
  Skeleton,
  Spinner,
  Switch,
  TextField,
  Tooltip,
  useOverlayState,
} from '@heroui/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import FormSection from '../common/FormSection.jsx';
import ConfirmAlertDialog from '../ConfirmAlertDialog.jsx';
import RoomStatusChip from './RoomStatusChip.jsx';
import NotFoundPage from '../../page/NotFoundPage.jsx';
import SomethingWentWrongPage from '../../page/SomethingWentWrongPage.jsx';
import { ToastUtil } from '../../util/toastUtil.js';
import { RoomClient } from '../../api/room/index.js';
import RoomRuleItemList from './RoomRuleItemList.jsx';
import { ArrowLeft, TrashBin } from '@gravity-ui/icons';

const enabledMessage = {
  true: {
    title: '대기열 활성화',
    subtitle: '대기열에 대기열이 적용되어 활성사용자 수를 제어합니다.',
  },
  false: {
    title: '대기열 비활성화',
    subtitle: '대기열에 대기열이 적용되지 않고, 즉시 진입이 가능한 상태가 됩니다',
  },
};
const DEFAULT_RULE_TYPES = [
  {
    value: 'ALL',
    name: '전체 적용 (ALL)',
    description: '별도 조건 없이 이 대기열을 모든 요청에 적용합니다.',
  },
  {
    value: 'INCLUDE',
    name: '조건 일치 시 적용 (INCLUDE)',
    description: '아래 적용 조건 중 하나와 일치하는 요청에만 대기열을 적용합니다.',
  },
  {
    value: 'EXCLUDE',
    name: '조건 일치 시 제외 (EXCLUDE)',
    description: '아래 적용 조건과 일치하는 요청을 제외한 나머지 요청에 대기열을 적용합니다.',
  },
];

const ROOM_ENVIRONMENT_RADIO_OPTIONS = [
  { value: 'LIVE', description: '운영 환경을 위한 대기열 입니다.', title: '운영 (LIVE)' },
  { value: 'DEV', description: '개발 환경을 위한 대기열 입니다.', title: '개발 (DEV)' },
];

const IMAGE_AD_RADIO_OPTIONS = [
  { value: 'URL', description: '이미지 URL을 입력합니다.', title: 'URL 입력' },
  { value: 'IMAGE_UPLOAD', description: '배너 이미지를 업로드하여 노출합니다.', title: '이미지 업로드' },
];

const defaultRoomRule = {
  value: '',
  matchOperator: 'EQUAL',
  description: '',
};

export default function RoomDetailForm({ onPressBack }) {
  const [errorStatus, setErrorStatus] = useState(null);
  const { roomId } = useParams();

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const [room, setRoom] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setDescription] = useState('');
  const [editCapacity, setEditCapacity] = useState(0);
  const [editMaxTrafficPerSecond, setEditMaxTrafficPerSecond] = useState(0);
  const [editEnabled, setEditEnabled] = useState(true);
  const [editDefaultDestinationUrl, setEditDefaultDestinationUrl] = useState('');
  const [selectDefaultRuleType, setSelectDefaultRuleType] = useState('ALL');
  const [editRoomRules, setEditRoomRules] = useState([{ ...defaultRoomRule }]);
  const [selectRoomEnvironment, setSelectRoomEnvironment] = useState('DEV');
  const [selectAdImageType, setSelectAdImageType] = useState('URL');
  const [editAdImageUrl, setEditAdImageUrl] = useState('');
  const [previewAdImageUrl, setPreviewAdImageUrl] = useState('');
  const [previewAdImageRequestId, setPreviewAdImageRequestId] = useState(0);
  const [adImagePreviewStatus, setAdImagePreviewStatus] = useState('empty');
  const adImagePreviewRequestIdRef = useRef(0);

  const navigate = useNavigate();

  const state = useOverlayState();

  const clearForm = useCallback(() => {
    setEditName('');
    setDescription('');
    setEditCapacity(0);
    setEditMaxTrafficPerSecond(0);
    setEditEnabled(false);
    setSelectDefaultRuleType('ALL');
    setEditDefaultDestinationUrl('');
    setEditAdImageUrl('');
    setEditRoomRules([defaultRoomRule]);
    setSelectRoomEnvironment('DEV');
  }, []);

  const handleMaxTrafficPerSecondChange = (val) => {
    setEditMaxTrafficPerSecond(val);
  };

  const handleCapacityChange = (val) => {
    setEditCapacity(val);
  };

  const fetchRoom = useCallback(
    async (fetchOptions = { clear: true }) => {
      if (fetchOptions.clear) {
        clearForm();
      }

      try {
        const data = await RoomClient.getRoomById(roomId);
        setRoom(data);
        setEditName(data.name || '');
        setDescription(data.description || '');
        setEditCapacity(data.capacity || '');
        setEditMaxTrafficPerSecond(data.maxTrafficPerSecond ?? 0);
        setEditEnabled(data?.enabled != null ? data.enabled : false);
        setEditDefaultDestinationUrl(data?.defaultDestinationUrl?.trim() ?? '');
        setEditRoomRules(data?.roomRules || []);
        setSelectDefaultRuleType(data?.defaultRuleType || 'ALL');
        setEditAdImageUrl(data?.adImageUrl?.trim() ?? '');
        setSelectRoomEnvironment(data?.roomEnvironment || 'DEV');
      } catch (error) {
        console.error('Error fetching:', error);
        setErrorStatus(error.status);
      } finally {
        setIsPageLoading(false);
      }
    },
    [clearForm, roomId]
  );

  // Location 이동 시 실행
  useEffect(() => {
    if (!roomId) {
      setIsPageLoading(false);
      return;
    }
    fetchRoom();
  }, [fetchRoom, roomId]);

  useEffect(() => {
    const imageUrl = editAdImageUrl.trim();
    const requestId = adImagePreviewRequestIdRef.current + 1;
    adImagePreviewRequestIdRef.current = requestId;

    if (!imageUrl) {
      setPreviewAdImageUrl('');
      setAdImagePreviewStatus('empty');
      return undefined;
    }

    setAdImagePreviewStatus('debouncing');
    const debounceTimer = window.setTimeout(() => {
      setPreviewAdImageUrl(imageUrl);
      setPreviewAdImageRequestId(requestId);
      setAdImagePreviewStatus('loading');
    }, 500);

    return () => window.clearTimeout(debounceTimer);
  }, [editAdImageUrl]);

  const handleAdImagePreviewLoad = useCallback((requestId) => {
    if (requestId === adImagePreviewRequestIdRef.current) {
      setAdImagePreviewStatus('loaded');
    }
  }, []);

  const handleAdImagePreviewError = useCallback((requestId) => {
    if (requestId === adImagePreviewRequestIdRef.current) {
      setAdImagePreviewStatus('error');
    }
  }, []);

  const handleAdImageUrlChange = (event) => {
    adImagePreviewRequestIdRef.current += 1;
    setEditAdImageUrl(event.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitLoading(true);

    const data = {
      name: editName,
      description: editDescription,
      capacity: editCapacity,
      maxTrafficPerSecond: editMaxTrafficPerSecond,
      enabled: editEnabled,
      defaultRuleType: selectDefaultRuleType,
      defaultDestinationUrl: editDefaultDestinationUrl,
      adImageUrl: editAdImageUrl,
      roomRules: editRoomRules,
      roomEnvironment: selectRoomEnvironment,
      updateRule: true,
    };

    try {
      if (roomId) {
        // roomId가 있는 경우 업데이트 화면
        await RoomClient.updateRoomById(roomId, data);
        await fetchRoom({ clear: false });
      } else {
        // 없는 경우 생성 화면
        const response = await RoomClient.createRoom(data);
        if (response.status === 201) {
          navigate(`/rooms/${response.data.roomId}`);
        } else {
          throw new Error('failed to create room ' + JSON.stringify(response));
        }
      }
      ToastUtil.success('대기열 상세', '성공적으로 저장했습니다.');
    } catch (error) {
      console.error(error.response);
      ToastUtil.error('대기열 상세', '저장에 실패했습니다.');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleDeleteRoomPress = useCallback(
    (isOpen) => {
      if (isOpen) {
        // 열리는 상태일 때
        if (room?.enabled) {
          ToastUtil.error('활성화 상태의 대기열은 삭제할 수 없습니다.', '대기열을 먼저 비활성화 해 주세요');
          return; // 활성화 상태의 대기열은 삭제불가
        }
      }
      state.setOpen(isOpen);
    },
    [room, state]
  );

  const handleDeleteConfirmed = useCallback(async () => {
    setIsSubmitLoading(true);
    try {
      await RoomClient.deleteRoomById(roomId);
      ToastUtil.success('대기열 삭제', '대기열이 성공적으로 삭제되었습니다.');
      navigate('/rooms');
    } catch (error) {
      if (error.status === 409) {
        ToastUtil.error('대기열을 삭제할 수 없습니다,', error.response?.data?.detail);
        state.setOpen(false);
      } else {
        console.error('삭제 실패:', error);
        ToastUtil.error('대기열 삭제', '삭제에 실패했습니다.');
      }
    } finally {
      setIsSubmitLoading(false);
    }
  }, [navigate, roomId, state]);

  const handleChangeRoomRule = (idx, field, value) => {
    const newRules = editRoomRules.map((rule, i) => (i === idx ? { ...rule, [field]: value } : rule));
    setEditRoomRules(newRules);
  };

  const handleAddRoomRule = () => {
    const newRules = [...editRoomRules, { ...defaultRoomRule }];
    setEditRoomRules(newRules);
  };

  const handleRemoveRoomRule = (index) => {
    const newRules = editRoomRules.filter((rule, i) => i !== index);
    setEditRoomRules(newRules);
  };

  const handleSelectDefaultRuleTypeChange = (value) => {
    setSelectDefaultRuleType(value);
  };

  if (errorStatus === 404) {
    return <NotFoundPage />;
  } else if (errorStatus === 500) {
    return <SomethingWentWrongPage />;
  }

  return (
    <>
      <Form className="w-full flex flex-col" onSubmit={handleSubmit}>
        <div className="relative w-full flex flex-col gap-4 min-w-2xl">
          <div className="w-full">
            <div className="flex justify-between items-center">
              {isPageLoading ? (
                <Skeleton className="rounded-lg w-full h-10"></Skeleton>
              ) : (
                <div className="flex items-baseline gap-2">
                  <div className="font-bold text-3xl">대기열 {roomId == null ? '생성' : '상세'}</div>
                  {<RoomStatusChip enabled={room?.enabled} />}
                </div>
              )}
              <div className="flex flex-row gap-4">
                {roomId && (
                  <ConfirmAlertDialog
                    title="정말로 이 대기열을 삭제하시겠습니까?"
                    message="대기열이 즉시 삭제되며 이 작업은 복구할 수 없습니다."
                    confirmMessage="삭제하기"
                    isOpen={state.isOpen}
                    onConfirm={handleDeleteConfirmed}
                    onOpenChange={handleDeleteRoomPress}
                  >
                    <Tooltip shouldCloseOnPress={false}>
                      <Button size="md" isIconOnly variant="ghost">
                        <TrashBin className="h-5 w-5" />
                      </Button>
                      <Tooltip.Content showArrow placement="left">
                        대기열 삭제하기
                      </Tooltip.Content>
                    </Tooltip>
                  </ConfirmAlertDialog>
                )}
                <Tooltip>
                  <Button size="md" isIconOnly variant="ghost" onPress={onPressBack}>
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <Tooltip.Content showArrow placement="top">
                    뒤로가기
                  </Tooltip.Content>
                </Tooltip>
              </div>
            </div>
          </div>
          <FormSection title="기본 설정">
            {isPageLoading ? (
              <div className="flex flex-col gap-6">
                <Skeleton className="rounded-lg w-full h-18" />
                <Skeleton className="rounded-lg w-full h-21" />
                <Skeleton className="rounded-lg w-full h-21" />
              </div>
            ) : (
              <div className="flex flex-col w-full gap-6">
                {roomId != null && (
                  <TextField name="roomId" type="text" isReadOnly className="w-full max-w-2xl" variant="default">
                    <Label className="text-base">대기열 ID</Label>
                    <Input className="ring-1 focus:ring-2 ring-neutral-200 bg-neutral-100" value={roomId} />
                  </TextField>
                )}
                <TextField name="roomName" type="text" isRequired className="w-full max-w-2xl" variant="default">
                  <Label className="text-base">대기열 이름</Label>
                  <Input
                    className="ring-1 focus:ring-2 ring-neutral-200 focus:ring-accent"
                    placeholder="대기열 이름을 입력하세요."
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <Description className="text-sm">대기열의 이름 입니다.</Description>
                  <FieldError>필수 입력값입니다.</FieldError>
                </TextField>
                <TextField name="description" type="text" isRequired className="w-full max-w-2xl" variant="default">
                  <Label className="text-base">대기열 설명</Label>
                  <Input
                    className="ring-1 focus:ring-2 ring-neutral-200 focus:ring-accent"
                    placeholder="대기열에 대해 알려주세요."
                    value={editDescription}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <Description className="text-sm">대기열에 대한 상세 설명입니다.</Description>
                  <FieldError>필수 입력값입니다.</FieldError>
                </TextField>

                <RadioGroup
                  isRequired
                  value={selectRoomEnvironment}
                  onChange={setSelectRoomEnvironment}
                  variant="secondary"
                >
                  <Label className="text-base" isRequired>
                    대기열 환경 태그
                  </Label>
                  <div className="flex gap-2 items-center max-w-2xl">
                    {ROOM_ENVIRONMENT_RADIO_OPTIONS.map((option) => (
                      <Radio
                        key={option.value}
                        value={option.value}
                        className="flex-1 items-stretch rounded-2xl data-[selected=true]:ring-2 ring ring-neutral-300 bg-surface px-5 py-4 transition-all data-[selected=true]:ring-accent"
                      >
                        <Radio.Content className="flex w-full items-center gap-3">
                          <Radio.Control>
                            <Radio.Indicator />
                          </Radio.Control>
                          <span className="text-base">{option.title}</span>
                        </Radio.Content>
                        <Description className="text-sm">{option.description}</Description>
                      </Radio>
                    ))}
                  </div>
                  <FieldError>다음 옵션 중 하나를 선택하세요.</FieldError>
                </RadioGroup>
              </div>
            )}
          </FormSection>
          {/*<Skeleton className="rounded-lg w-full" isLoaded={!isEventLoading}></Skeleton>*/}
          <FormSection title="유량 제어">
            {isPageLoading ? (
              <div className="flex flex-col gap-6">
                <Skeleton className="rounded-lg w-full h-28" />
                <Skeleton className="rounded-lg w-full h-27" />
                <Skeleton className="rounded-lg w-full h-27" />
              </div>
            ) : (
              <div className="flex flex-col w-full gap-6">
                <div className="flex flex-col gap-2">
                  <Label className="text-base" isRequired>
                    대기열 활성/비활성화
                  </Label>
                  <Switch
                    isSelected={editEnabled}
                    onChange={setEditEnabled}
                    className="group w-full max-w-lg"
                    isRequired
                  >
                    <Switch.Content className="flex w-full flex-row-reverse items-center justify-between gap-2 rounded-lg border-2 border-default bg-white p-4 hover:bg-neutral-100 group-data-[selected=true]:border-accent">
                      <Switch.Control>
                        <Switch.Thumb>
                          <Switch.Icon />
                        </Switch.Thumb>
                      </Switch.Control>
                      <span className="flex min-w-0 flex-col gap-1">
                        <span className="text-base">{enabledMessage[editEnabled]?.title}</span>
                        <span className="text-sm text-muted">{enabledMessage[editEnabled]?.subtitle}</span>
                      </span>
                    </Switch.Content>
                  </Switch>
                </div>

                <NumberField
                  value={editCapacity}
                  onChange={handleCapacityChange}
                  minValue={0}
                  variant="primary"
                  isRequired
                >
                  <Label className="text-base">최대 사용자수</Label>
                  <NumberField.Group className="w-40 ring-1 focus-within:ring-2 ring-neutral-200 focus-within:ring-accent">
                    <NumberField.DecrementButton />
                    <NumberField.Input />
                    <NumberField.IncrementButton />
                  </NumberField.Group>
                  <Description className="text-sm">
                    <div className="flex flex-col text-sm">
                      <span>화면에 머무를 수 있는 사용자 수를 제한합니다.</span>
                      <span>0으로 설정하면 화면으로 진입할 수 없게 됩니다.</span>
                    </div>
                  </Description>
                </NumberField>

                <NumberField
                  value={editMaxTrafficPerSecond}
                  onChange={handleMaxTrafficPerSecondChange}
                  minValue={0}
                  isRequired
                >
                  <Label className="text-base">초당 유입량</Label>
                  <NumberField.Group className="w-40 ring-1 focus-within:ring-2 ring-neutral-200 focus-within:ring-accent">
                    <NumberField.DecrementButton />
                    <NumberField.Input />
                    <NumberField.IncrementButton />
                  </NumberField.Group>
                  <Description className="text-sm">
                    <div className="flex flex-col text-sm">
                      <span>1초마다 화면으로 고객이 입장하는 속도를 조절합니다.</span>
                      <span>0으로 설정하면 진입이 멈춥니다.</span>
                    </div>
                  </Description>
                </NumberField>
              </div>
            )}
          </FormSection>
          <FormSection title="대기열 규칙">
            {isPageLoading ? (
              <div className="flex flex-col gap-6">
                <Skeleton className="rounded-lg w-full h-22" />
                <Skeleton className="rounded-lg w-full h-22" />
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <TextField
                  name="defaultDestinationUrl"
                  type="text"
                  className="w-full max-w-2xl"
                  variant="primary"
                  isRequired
                >
                  <Label className="text-base">기본 목적지 URL</Label>
                  <Input
                    className="ring-1 focus:ring-2 ring-neutral-200 focus:ring-accent"
                    placeholder="https://www.example.com"
                    value={editDefaultDestinationUrl}
                    onChange={(e) => setEditDefaultDestinationUrl(e.target.value)}
                  />
                  <Description className="text-sm">목적지가 명시되지 않았을 때 이 URL로 이동하게 됩니다.</Description>
                  <FieldError>필수 항목을 입력해 주세요.</FieldError>
                </TextField>
                <div>
                  <Select isRequired value={selectDefaultRuleType} onChange={handleSelectDefaultRuleTypeChange}>
                    <Label className="text-base">대기열 적용 방식</Label>
                    <Select.Trigger className="max-w-64 ring-1 focus:ring-2 ring-neutral-200 focus:ring-accent">
                      <Select.Value>{({ state }) => state.selectedItems[0]?.textValue}</Select.Value>
                      <Select.Indicator />
                    </Select.Trigger>

                    <Select.Popover placement="bottom start">
                      <ListBox>
                        {DEFAULT_RULE_TYPES.map((defaultType) => (
                          <ListBox.Item key={defaultType.value} id={defaultType.value} textValue={defaultType.name}>
                            <div className="flex gap-2 items-center">
                              <div className="flex flex-col">
                                <span className="text-base">{defaultType.name}</span>
                                <span className="text-sm text-neutral-500">{defaultType.description}</span>
                              </div>
                            </div>
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                    <Description className="text-sm">
                      {DEFAULT_RULE_TYPES.filter((t) => t.value === selectDefaultRuleType).map((v) => v.description)}
                    </Description>
                    <FieldError>필수 항목을 입력해 주세요.</FieldError>
                  </Select>
                </div>
                {(selectDefaultRuleType === 'INCLUDE' || selectDefaultRuleType === 'EXCLUDE') && (
                  <div id="room-rules" className="flex flex-col gap-2">
                    <Label className="text-base">적용 조건</Label>
                    <Description className="text-sm text-muted">
                      요청 URL 또는 전달 값이 아래 조건과 일치하는지 비교합니다. 조건은 여러 개 등록할 수 있습니다.
                    </Description>
                    <RoomRuleItemList
                      rules={editRoomRules}
                      onChange={handleChangeRoomRule}
                      onAdd={handleAddRoomRule}
                      onDelete={handleRemoveRoomRule}
                    />
                  </div>
                )}
              </div>
            )}
          </FormSection>

          <FormSection title="대기화면 구성">
            {isPageLoading ? (
              <div className="flex flex-col gap-6">
                <Skeleton className="rounded-lg w-full h-28" />
                <Skeleton className="rounded-lg w-full h-27" />
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <RadioGroup isRequired value={selectAdImageType} onChange={setSelectAdImageType} variant="secondary">
                  <Label className="text-base" isRequired>
                    광고 유형
                  </Label>
                  <div className="flex gap-2 items-center max-w-2xl">
                    {IMAGE_AD_RADIO_OPTIONS.map((option) => (
                      <Radio
                        key={option.value}
                        value={option.value}
                        className="flex-1 items-stretch rounded-2xl data-[selected=true]:ring-2 ring ring-neutral-300 bg-surface px-5 py-4 transition-all data-[selected=true]:ring-accent"
                      >
                        <Radio.Content className="flex w-full items-center gap-3">
                          <Radio.Control>
                            <Radio.Indicator />
                          </Radio.Control>
                          <span className="text-base">{option.title}</span>
                        </Radio.Content>
                        <Description className="text-sm">{option.description}</Description>
                      </Radio>
                    ))}
                  </div>
                  <FieldError>다음 옵션 중 하나를 선택하세요.</FieldError>
                </RadioGroup>
                <div className="mt-6">
                  {selectAdImageType === 'URL' ? (
                    <TextField name="adImageUrl" type="text" className="w-full max-w-2xl" variant="primary" isRequired>
                      <Label className="text-base">대기열 광고 이미지 URL</Label>
                      <Input
                        className="ring-1 focus:ring-2 ring-neutral-200 focus:ring-accent"
                        placeholder="https://example.com/image.jpg"
                        value={editAdImageUrl}
                        onChange={handleAdImageUrlChange}
                      />
                      <Description className="flex flex-col text-sm">
                        <span>
                          HTTPS 프로토콜만 지원하며, 대기열 대기 중 사용자에게 노출될 배너 이미지의 전체 경로를 입력해
                          주세요.
                        </span>
                        <span>(권장 규격: 1080x1920px, JPG/PNG 형식)</span>
                      </Description>
                      <FieldError>필수 항목을 입력해 주세요.</FieldError>
                    </TextField>
                  ) : (
                    <div className="mt-4 flex"> 기능 추후 지원예정</div>
                  )}
                  {selectAdImageType === 'URL' && (
                    <div className="mt-4 max-w-2xl">
                      <Label className="mb-2 block text-base">이미지 미리보기</Label>
                      <div className="flex h-72 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                        {adImagePreviewStatus === 'empty' && (
                          <p className="text-center text-sm text-neutral-500">
                            이미지 URL을 입력하면 이 영역에서 미리볼 수 있습니다.
                          </p>
                        )}
                        {adImagePreviewStatus === 'debouncing' && (
                          <div className="flex flex-col items-center gap-2 text-center text-sm text-neutral-500">
                            <Spinner color="current" size="sm" />
                            <span>입력을 멈추면 새 이미지를 확인합니다.</span>
                          </div>
                        )}
                        {adImagePreviewStatus === 'loading' && (
                          <div className="flex flex-col items-center gap-2 text-center text-sm text-neutral-500">
                            <Spinner color="current" size="sm" />
                            <span>이미지를 불러오는 중입니다.</span>
                          </div>
                        )}
                        {adImagePreviewStatus === 'error' && (
                          <p className="text-center text-sm text-danger-600">
                            이미지를 불러오지 못했습니다. URL과 이미지 접근 권한을 확인해 주세요.
                          </p>
                        )}
                        {(adImagePreviewStatus === 'loading' || adImagePreviewStatus === 'loaded') &&
                          previewAdImageUrl && (
                            <img
                              key={previewAdImageRequestId}
                              src={previewAdImageUrl}
                              alt="대기열 광고 이미지 미리보기"
                              className={cn(
                                'max-h-full max-w-full rounded-lg object-contain',
                                adImagePreviewStatus === 'loading' && 'hidden'
                              )}
                              onLoad={() => handleAdImagePreviewLoad(previewAdImageRequestId)}
                              onError={() => handleAdImagePreviewError(previewAdImageRequestId)}
                            />
                          )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </FormSection>
        </div>
        <div className="bottom-2 sticky mt-4 w-full bg-white rounded-xl z-20">
          <Button type="submit" className="h-10 rounded-2xl" isPending={isSubmitLoading} fullWidth>
            {isSubmitLoading ? <Spinner color="current" size="sm" /> : null}
            저장하기
          </Button>
        </div>
      </Form>
    </>
  );
}
