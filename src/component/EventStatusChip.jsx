import { Chip } from '@heroui/react';

export default function EventStatusChip({ status, size = 'md' }) {
  switch (status) {
    case 'upcoming':
      return (
        <Chip color="warning" variant="flat" size={size}>
          오픈예정
        </Chip>
      );
    case 'open':
      return (
        <Chip color="success" variant="flat" size={size}>
          진행중
        </Chip>
      );
    case 'closed':
      return (
        <Chip color="default" variant="flat" size={size}>
          종료
        </Chip>
      );
    case 'special':
      return (
        <Chip
          classNames={{
            base: 'bg-gradient-to-br from-indigo-500 to-pink-500 border-small border-white/50 shadow-pink-500/30',
            content: 'drop-shadow shadow-black text-white',
          }}
          variant="shadow"
          size={size}
        >
          스페셜
        </Chip>
      );
    default:
      return;
  }
}
