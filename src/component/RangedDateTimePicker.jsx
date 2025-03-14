import { DateRangePicker } from '@heroui/react';
import { parseZonedDateTime } from '@internationalized/date';

export default function RangedDateTimePicker() {
  return (
    <div className="w-full max-w-xl flex flex-row gap-4">
      <DateRangePicker
        hideTimeZone
        defaultValue={{
          start: parseZonedDateTime('2024-04-01T00:45[Asia/Seoul]'),
          end: parseZonedDateTime('2024-04-08T11:15[Asia/Seoul]'),
        }}
        label="Event duration"
        visibleMonths={2}
      />
    </div>
  );
}
