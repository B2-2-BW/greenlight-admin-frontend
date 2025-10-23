import { Chip } from '@heroui/react';

export default function ActionDefaultRuleTypeChip({ type = 'ALL', size = 'md' }) {
  switch (type) {
    case 'ALL':
      return (
        <Chip className="bg-red-200" variant="flat" size={size}>
          All
        </Chip>
      );
    case 'INCLUDE':
      return (
        <Chip color="secondary" variant="flat" size={size}>
          Include
        </Chip>
      );
    case 'EXCLUDE':
      return (
        <Chip color="success" variant="flat" size={size}>
          Exclude
        </Chip>
      );
    default:
      return;
  }
}
