import { cn, Radio } from '@heroui/react';

export default function ActionTypeRadio(props) {
  const { children, size, ...otherProps } = props;
  return (
    <Radio
      {...otherProps}
      className={cn(
        'm-0 bg-content1 hover:bg-surface-hover',
        'cursor-pointer rounded-lg p-4 border-2 border-transparent',
        'data-[selected=true]:border-accent',
        size
      )}
    >
      <Radio.Content className="flex w-full items-center gap-4">
        <Radio.Control>
          <Radio.Indicator />
        </Radio.Control>
        {children}
      </Radio.Content>
    </Radio>
  );
}
