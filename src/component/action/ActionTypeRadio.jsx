import { cn, Radio } from '@heroui/react';

export default function ActionTypeRadio(props) {
  const { children, size, ...otherProps } = props;
  return (
    <Radio
      {...otherProps}
      classNames={{
        base: cn(
          'm-0 bg-content1 hover:bg-content2',
          'cursor-pointer rounded-lg gap-4 p-4 border-2 border-transparent',
          'data-[selected=true]:border-primary ' + size
        ),
      }}
    >
      {children}
    </Radio>
  );
}
