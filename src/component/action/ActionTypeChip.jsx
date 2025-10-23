import { Chip } from '@heroui/react';

export default function ActionTypeChip({ type = 'ALL', size = 'md' }) {
  switch (type) {
    case 'DIRECT':
      return (
        <Chip variant="shadow" size={size}>
          Direct
        </Chip>
      );
    case 'LANDING':
      return (
        <Chip color="secondary" variant="flat" size={size}>
          Landing
        </Chip>
      );
    default:
      return;
  }
}
