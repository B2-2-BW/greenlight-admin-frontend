import { Label, ListBox, Select } from '@heroui/react';

export default function FieldSelect({
  label,
  value,
  onChange,
  options,
  className = 'w-full max-w-2xl',
  triggerClassName = 'min-h-11 w-full items-center ring-1 focus:ring-2 ring-neutral-200 focus:ring-accent sm:max-w-64',
  placeholder = '선택',
  isDisabled = false,
  'aria-label': ariaLabel,
}) {
  return (
    <Select
      className={className}
      aria-label={ariaLabel || label}
      value={value}
      onChange={(key) => {
        if (key == null) return;
        onChange(String(key));
      }}
      isDisabled={isDisabled}
    >
      {label ? <Label className="text-base">{label}</Label> : null}
      <Select.Trigger className={triggerClassName}>
        <Select.Value>{({ state }) => state.selectedItems[0]?.textValue ?? placeholder}</Select.Value>
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover className="max-w-[calc(100vw-2rem)] w-64" placement="bottom start">
        <ListBox>
          {options.map((option) => (
            <ListBox.Item key={option.value} id={option.value} textValue={option.label}>
              <ListBox.ItemIndicator />
              {option.label}
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
