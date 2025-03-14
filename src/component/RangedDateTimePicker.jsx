import { DateRangePicker } from '@heroui/react';

export default function RangedDateTimePicker({ value, onChange }) {
  return (
    <DateRangePicker
      isRequired
      hideTimeZone
      granularity="minute"
      label="이벤트 기간"
      labelPlacement="outside"
      visibleMonths={2}
      description="대기열에 입장할 수 있는 시작시간과 종료시간을 입력해주세요."
      hourCycle={24}
      value={value}
      onChange={onChange}
    />
  );
}
