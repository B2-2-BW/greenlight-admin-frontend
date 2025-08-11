const baseInputProps = {
  size: 'lg',
  classNames: {
    description: 'text-sm',
  },
  labelPlacement: 'outside',
};

export const requiredInputProps = {
  ...baseInputProps,
  isRequired: true,
  errorMessage: '필수 항목을 입력해 주세요.',
  variant: 'bordered',
};
export const optionalInputProps = {
  ...baseInputProps,
  variant: 'bordered',
};

export const readonlyInputProps = {
  ...baseInputProps,
  variant: 'flat',
  readOnly: true,
};
