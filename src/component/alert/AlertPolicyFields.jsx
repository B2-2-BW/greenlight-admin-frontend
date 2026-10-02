import { Description, Input, Label, NumberField, TextField } from '@heroui/react';
import FieldSelect from '../common/FieldSelect.jsx';
import { compareOptions } from '../../util/alertPolicy.js';

const fieldClass = 'ring-1 focus:ring-2 ring-neutral-200 focus:ring-accent';

function MetricFields({ title, compare, threshold, onCompareChange, onThresholdChange }) {
  const isPercent = compare === 'PERCENT';
  const fieldValue = Number(threshold);
  return (
    <div className="flex flex-col gap-2">
      <p className="text-base font-medium">{title}</p>
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end">
        <FieldSelect
          className="w-full sm:max-w-48"
          label="비교 방식"
          value={compare}
          onChange={onCompareChange}
          options={compareOptions}
        />
        <NumberField
          className="w-full sm:flex-1"
          value={Number.isFinite(fieldValue) ? (isPercent ? fieldValue / 100 : fieldValue) : Number.NaN}
          onChange={(next) => {
            if (Number.isNaN(next)) return;
            onThresholdChange(isPercent ? next * 100 : next);
          }}
          minValue={isPercent ? 0.001 : 1}
          formatOptions={isPercent ? { style: 'percent' } : undefined}
        >
          <Label className="text-base">기준</Label>
          <NumberField.Group className="min-h-11 w-full ring-1 focus-within:ring-2 ring-neutral-200 focus-within:ring-accent">
            <NumberField.DecrementButton />
            <NumberField.Input />
            <NumberField.IncrementButton />
          </NumberField.Group>
        </NumberField>
      </div>
      <Description className="text-sm text-muted">
        {isPercent ? '해당 대기열 수용인원 대비 비율입니다.' : '이 인원 이상이면 알림을 보냅니다.'}
      </Description>
    </div>
  );
}

export default function AlertPolicyFields({ policy, setPolicy }) {
  const update = (patch) => setPolicy((current) => ({ ...current, ...patch }));
  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <MetricFields
        title="대기인원"
        compare={policy.waitingCompare}
        threshold={policy.waitingThreshold}
        onCompareChange={(waitingCompare) => update({ waitingCompare })}
        onThresholdChange={(waitingThreshold) => update({ waitingThreshold })}
      />
      <TextField className="w-full">
        <Label className="text-base">연속 확인 횟수</Label>
        <Input
          className={`${fieldClass} text-base`}
          type="number"
          min={1}
          value={String(policy.forTicks ?? '')}
          onChange={(event) => update({ forTicks: Number(event.target.value) })}
        />
        <Description className="text-sm text-muted">
          3초마다 한 번 확인합니다. 2면 약 6초 동안 기준을 넘어야 첫 알림을 보냅니다.
        </Description>
      </TextField>
      <TextField className="w-full">
        <Label className="text-base">다시 보내는 간격 (초)</Label>
        <Input
          className={`${fieldClass} text-base`}
          type="number"
          min={1}
          value={String(policy.repeatIntervalSeconds ?? '')}
          onChange={(event) => update({ repeatIntervalSeconds: Number(event.target.value) })}
        />
      </TextField>
    </div>
  );
}
