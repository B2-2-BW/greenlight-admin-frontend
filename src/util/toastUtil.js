import { addToast } from '@heroui/react';

const success = (title, description) => {
  addToast({
    title: title,
    description: description,
    color: 'success',
  });
};

const error = (title, description) => {
  addToast({
    title: title,
    description: description,
    color: 'danger',
  });
};
export const ToastUtil = {
  success,
  error,
};
