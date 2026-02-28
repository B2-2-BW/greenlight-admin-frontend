import {
  Button,
  cn,
  Form,
  Input,
  NumberInput,
  RadioGroup,
  Select,
  SelectItem,
  Skeleton,
  Switch,
  Tooltip,
  useDisclosure,
} from '@heroui/react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import DeleteSvg from '../../icon/Delete.jsx';
import ArrowBackSvg from '../../icon/ArrowBackSvg.jsx';
import SectionTitle from '../common/SectionTitle.jsx';
import ConfirmModal from '../ConfirmModal.jsx';
import RoomStatusChip from './RoomStatusChip.jsx';
import NotFoundPage from '../../page/NotFoundPage.jsx';
import SomethingWentWrongPage from '../../page/SomethingWentWrongPage.jsx';
import { ToastUtil } from '../../util/toastUtil.js';
import { readonlyInputProps, requiredInputProps } from '../../shared/props.js';
import ActionTypeRadio from '../action/ActionTypeRadio.jsx';
import { RoomClient } from '../../api/room/index.js';
import RoomRuleItemList from './RoomRuleItemList.jsx';

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
    name: 'ALL (기본값)',
    description: '모든 요청에 대해 대기열이 활성화됩니다.',
  },
  {
    value: 'INCLUDE',
    name: 'INCLUDE',
    description: 'URL에 특정 문자를 포함하는 경우 대기열이 활성화됩니다',
  },
  {
    value: 'EXCLUDE',
    name: 'EXCLUDE',
    description: 'URL에 특정 문자를 포함하는 경우를 제외하고 대기열이 활성화됩니다',
  },
];
const defaultRoomRule = {
  paramName: '',
  paramValue: '',
  matchOperator: 'EQUAL',
  description: '',
};

export default function RoomDetailForm({ onPressBack }) {
  const [errorStatus, setErrorStatus] = useState(null);
  const { roomId } = useParams();

  const [isPageLoading, setIsPageLoading] = useState(false);
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

  const [selectAdImageType, setSelectAdImageType] = useState('URL');
  const [editAdImageUrl, setEditAdImageUrl] = useState('');

  const navigate = useNavigate();

  const {
    isOpen: isOpenConfirm,
    onOpen: onOpenConfirm,
    onOpenChange: onOpenChangeConfirm,
    onClose: onCloseConfirm,
  } = useDisclosure();

  const clearForm = () => {
    setEditName('');
    setDescription('');
    setEditCapacity(0);
    setEditMaxTrafficPerSecond(0);
    setEditEnabled(false);
    setSelectDefaultRuleType('ALL');
    setEditDefaultDestinationUrl('');
    setEditAdImageUrl('');
  };

  const handleMaxTrafficPerSecondChange = (val) => {
    setEditMaxTrafficPerSecond(val);
  };

  const handleCapacityChange = (val) => {
    setEditCapacity(val);
  };

  const fetchRoom = async () => {
    setIsPageLoading(true);
    clearForm();

    try {
      const data = await RoomClient.getRoomById(roomId);
      setRoom(data);
      setEditName(data.name || '');
      setDescription(data.description || '');
      setEditCapacity(data.capacity || '');
      setEditMaxTrafficPerSecond(data.maxTrafficPerSecond ?? 0);
      setEditEnabled(data?.enabled != null ? data.enabled : false);
      setEditDefaultDestinationUrl(data?.defaultDestinationUrl.trim());
      setSelectDefaultRuleType(data?.defaultRuleType);
      setEditAdImageUrl(data?.adImageUrl.trim()); // TODO adImageUrl 추가하기
    } catch (error) {
      console.error('Error fetching:', error);
      setErrorStatus(error.status);
    } finally {
      setIsPageLoading(false);
    }
  };

  // Location 이동 시 실행
  useEffect(() => {
    if (!roomId) {
      return;
    }
    fetchRoom();
  }, [roomId]);

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
    };

    try {
      if (roomId) {
        // roomId가 있는 경우 업데이트 화면
        await RoomClient.updateRoomById(roomId, data);
        await fetchRoom();
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

  const handleDeleteConfirmed = async () => {
    setIsSubmitLoading(true);
    try {
      await RoomClient.deleteRoomById(roomId);
      ToastUtil.success('대기열 삭제', '대기열이 성공적으로 삭제되었습니다.');
      navigate('/rooms');
    } catch (error) {
      if (error.status === 409) {
        ToastUtil.error('대기열을 삭제할 수 없습니다,', error.response?.data?.detail);
        onCloseConfirm();
      } else {
        console.error('삭제 실패:', error);
        ToastUtil.error('대기열 삭제', '삭제에 실패했습니다.');
      }
    } finally {
      setIsSubmitLoading(false);
    }
  };

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

  const handleSelectDefaultRuleTypeChange = (e) => {
    setSelectDefaultRuleType(e.target.value);
  };

  const getEditAdComponent = () => {
    switch (selectAdImageType) {
      case 'URL':
        return (
          <Input
            className="w-full max-w-md"
            errorMessage="."
            label="대기열 광고 이미지 URL"
            name="description"
            placeholder="https://example.com/image.jpg"
            type="text"
            description="HTTPS 프로토콜만 지원하며, 대기열 대기 중 사용자에게 노출될 배너 이미지의 전체 경로를 입력해 주세요. (권장 규격: 1080x1920px, JPG/PNG 형식)"
            value={editAdImageUrl}
            onChange={(e) => setEditAdImageUrl(e.target.value)}
            {...requiredInputProps}
          />
        );
      case 'UPLOAD_IMAGE':
        return (
          <div className="mt-4 flex">
            지원예정
            {/*<Input type="file">ff</Input>*/}
          </div>
        );
    }
  };

  if (errorStatus === 404) {
    return <NotFoundPage />;
  } else if (errorStatus === 500) {
    return <SomethingWentWrongPage />;
  }

  return (
    <>
      <Form className="w-full flex flex-col" onSubmit={handleSubmit}>
        <div className="relative w-full flex flex-col gap-4">
          <div className="w-full">
            <div className="flex justify-between items-center">
              <div className="text-sm text-default-400 mb-1">{room?.name}</div>
              <div className="flex flex-row gap-6">
                {roomId && (
                  <Tooltip content="대기열 삭제하기">
                    <Button size="sm" className="p-1" isIconOnly variant="light" onPress={onOpenConfirm}>
                      <DeleteSvg />
                    </Button>
                  </Tooltip>
                )}
                <Tooltip content="뒤로가기">
                  <Button size="sm" isIconOnly variant="light" onPress={onPressBack}>
                    <ArrowBackSvg />
                  </Button>
                </Tooltip>
              </div>
            </div>
            <Skeleton className="rounded-lg w-full h-10" isLoaded={!isPageLoading}>
              <div className="flex items-baseline gap-2">
                <div className="font-bold text-3xl">대기열 {roomId == null ? '생성' : '상세'}</div>
                {<RoomStatusChip enabled={room?.enabled} />}
              </div>
            </Skeleton>
          </div>
          <SectionTitle title="기본 설정">
            <Skeleton className="rounded-lg w-full" isLoaded={!isPageLoading}>
              <div className="flex flex-col w-full gap-6">
                {roomId != null && (
                  <Input
                    className="w-full max-w-md"
                    label="대기열 ID"
                    name="roomId"
                    type="text"
                    value={roomId}
                    {...readonlyInputProps}
                  />
                )}
                <Input
                  className="w-full max-w-md"
                  label="대기열 이름"
                  placeholder="대기열 이름을 입력하세요."
                  name="name"
                  description="대기열의 이름 입니다."
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  {...requiredInputProps}
                />
                <Input
                  className="w-full max-w-md"
                  errorMessage="대기열 설명은 필수값입니다."
                  label="대기열 설명"
                  name="description"
                  placeholder="대기열에 대해 알려주세요."
                  type="text"
                  description="대기열에 대한 상세 설명입니다."
                  value={editDescription}
                  onChange={(e) => setDescription(e.target.value)}
                  {...requiredInputProps}
                />
              </div>
            </Skeleton>
          </SectionTitle>
          {/*<Skeleton className="rounded-lg w-full" isLoaded={!isEventLoading}></Skeleton>*/}
          <SectionTitle title="유량 제어">
            <Skeleton className="rounded-lg w-full" isLoaded={!isPageLoading}>
              <div className="flex flex-col w-full gap-6">
                <div>
                  <div className="mb-2 text-base after:content-['*'] after:text-danger after:ms-0.5">
                    대기열 활성/비활성화
                  </div>

                  <Switch
                    isSelected={editEnabled}
                    onValueChange={setEditEnabled}
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
                      <p className="text-base">{enabledMessage[editEnabled]?.title}</p>
                      <p className="text-sm text-default-400">{enabledMessage[editEnabled]?.subtitle}</p>
                    </div>
                  </Switch>
                </div>
                <NumberInput
                  className="w-full max-w-md"
                  label="최대 사용자수"
                  name="capacity"
                  placeholder=" "
                  minValue={0}
                  description={
                    <div className="flex flex-col text-sm">
                      <span>화면에 머무를 수 있는 사용자 수를 제한합니다.</span>
                      <span>0으로 설정하면 화면으로 진입할 수 없게 됩니다.</span>
                    </div>
                  }
                  value={editCapacity}
                  onValueChange={handleCapacityChange}
                  {...requiredInputProps}
                  classNames={{
                    inputWrapper: 'max-w-40',
                  }}
                />
                <NumberInput
                  className="w-full max-w-md"
                  label="초당 유입량"
                  name="maxTrafficPerSecond"
                  placeholder=" "
                  minValue={0}
                  description={
                    <div className="flex flex-col text-sm">
                      <span>1초마다 화면으로 고객이 입장하는 속도를 조절합니다.</span>
                      <span>0으로 설정하면 진입이 멈춥니다.</span>
                    </div>
                  }
                  value={editMaxTrafficPerSecond}
                  onValueChange={handleMaxTrafficPerSecondChange}
                  {...requiredInputProps}
                  classNames={{
                    inputWrapper: 'max-w-40',
                  }}
                />
              </div>
            </Skeleton>
          </SectionTitle>
          <SectionTitle title="대기열 규칙">
            <Input
              className="w-full max-w-2xl"
              label="기본 목적지 URL"
              placeholder="https://www.example.com"
              name="defaultDestinationUrl"
              description="목적지가 명시되지 않았을 때 이 URL로 이동하게 됩니다."
              type="text"
              value={editDefaultDestinationUrl}
              onChange={(e) => setEditDefaultDestinationUrl(e.target.value)}
              {...requiredInputProps}
            />
            <div>
              <div className="mb-2 text-base after:content-['*'] after:text-danger after:ms-0.5">
                대기열 적용 규칙 유형
              </div>
              <Select
                className="max-w-[20rem] mt-0"
                items={DEFAULT_RULE_TYPES}
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
            </div>
            {(selectDefaultRuleType === 'INCLUDE' || selectDefaultRuleType === 'EXCLUDE') && (
              <div id="room-rules">
                <div className="mb-2 text-sm">대기열 적용 규칙</div>
                <RoomRuleItemList
                  rules={editRoomRules}
                  onChange={handleChangeRoomRule}
                  onAdd={handleAddRoomRule}
                  onDelete={handleRemoveRoomRule}
                />
              </div>
            )}
          </SectionTitle>

          <SectionTitle title="대기화면 구성">
            <Skeleton className="rounded-lg w-full" isLoaded={!isPageLoading}>
              <div id="room-type-radio-group">
                <div className="mb-2 text-base after:content-['*'] after:text-danger after:ms-0.5">광고 유형</div>
                <RadioGroup
                  value={selectAdImageType}
                  isRequired
                  errorMessage="다음 옵션 중 하나를 선택하세요."
                  onValueChange={setSelectAdImageType}
                  orientation="horizontal"
                  classNames={{
                    wrapper: 'flex',
                  }}
                >
                  <ActionTypeRadio description="이미지 URL을 입력합니다." value="URL">
                    URL 입력
                  </ActionTypeRadio>
                  <ActionTypeRadio description="배너 이미지를 업로드하여 노출합니다" value="IMAGE_UPLOAD">
                    이미지 업로드
                  </ActionTypeRadio>
                </RadioGroup>
                <div className="mt-12">{getEditAdComponent()}</div>
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

      <ConfirmModal
        isOpen={isOpenConfirm}
        onOpenChange={onOpenChangeConfirm}
        title="대기열 삭제"
        message="정말로 이 대기열을 삭제하시겠습니까?"
        onConfirm={handleDeleteConfirmed}
        onCancel={onCloseConfirm}
      />
    </>
  );
}
