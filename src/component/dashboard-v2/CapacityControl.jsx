import { useState, useEffect } from 'react';
import { Popover, PopoverTrigger, PopoverContent, Input, Button, ButtonGroup } from '@heroui/react';
import { SettingsOutlinedIcon } from '../../icon/Icons.jsx';

/**
 * @param {number} value - 현재 설정된 최대 수용 인원
 * @param {function} onChange - 변경 시 콜백 (newValue) => void
 * @param {number} step - 버튼 클릭 시 증감 단위 (기본 100)
 */

const steps = [-100, -10, 10, 100];

const CapacityControl = ({ trigger, isDisabled = false, value, onChange, step = 100 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  // Popover 열릴 때 현재 값으로 동기화
  useEffect(() => {
    if (isOpen) setTempValue(value);
  }, [isOpen, value]);

  // 변경 사항 적용 핸들러
  const handleCommit = () => {
    const finalValue = Math.max(0, Number(tempValue)); // 음수 방지
    onChange(finalValue);
    setIsOpen(false);
  };

  // 엔터키 입력 시 적용
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleCommit();
  };

  // 빠른 증감 함수
  const adjustValue = (amount) => {
    setTempValue((prev) => Math.max(0, Number(prev) + amount));
  };

  return (
    <Popover
      placement="right-start"
      showArrow={true}
      isOpen={isOpen}
      onOpenChange={(open) => setIsOpen(open)}
      classNames={{
        content: 'p-3 bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl',
      }}
    >
      <PopoverTrigger>
        <Button isIconOnly variant="light">
          <SettingsOutlinedIcon />
        </Button>
      </PopoverTrigger>

      <PopoverContent>
        <div className="w-[180px] flex flex-col gap-3">
          <div className="text-xs font-bold text-gray-500 mb-[-4px]">최대 수용 인원 설정</div>

          {/* 1. 직접 입력 Input */}
          <Input
            type="number"
            size="sm"
            variant="bordered"
            value={tempValue}
            min={0}
            onValueChange={setTempValue}
            onKeyDown={handleKeyDown}
            endContent={<span className="text-default-400 text-xs">명</span>}
          />

          {/* 2. 빠른 조작 버튼 (Preset) */}
          <div>
            <ButtonGroup size="sm" fullWidth variant="flat">
              {steps.map((step, i) => (
                <Button
                  className="min-w-10"
                  onPress={() => adjustValue(step)}
                  key={i}
                  variant="flat"
                  isDisabled={step < 0 ? tempValue === 0 : false}
                >
                  <span> {step < 0 ? step : `+${step}`}</span>
                </Button>
              ))}
            </ButtonGroup>
          </div>

          {/* 3. 적용 버튼 */}
          <Button size="sm" color="primary" variant="solid" fullWidth onPress={handleCommit}>
            적용하기
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CapacityControl;
