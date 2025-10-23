import { Chip } from '@heroui/react';

export default function ActionGroupStatusChip({ enabled, size = 'md' }) {
  switch (enabled) {
    case true:
      return (
        <Chip color="success" variant="flat" size={size}>
          활성
        </Chip>
      );
    case false:
      return (
        <Chip color="default" variant="flat" size={size}>
          비활성
        </Chip>
      );
    default:
      return;
  }
}
