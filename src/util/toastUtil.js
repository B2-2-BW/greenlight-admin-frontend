import { toast } from '@heroui/react';

const success = (title, description) => {
  toast.success(title, { description });
};

const error = (title, description) => {
  toast.danger(title, { description });
};
export const ToastUtil = {
  success,
  error,
};
