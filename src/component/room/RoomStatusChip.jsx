import { Chip } from '@heroui/react';

export default function RoomStatusChip({ enabled }) {
  switch (enabled) {
    case true:
      return <Chip className="text-green-700 bg-green-100">활성</Chip>;
    case false:
      return <Chip className="text-neutral-600 bg-neutral-100">비활성</Chip>;
    default:
      return;
  }
}
