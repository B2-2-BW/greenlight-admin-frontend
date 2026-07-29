import { Chip } from '@heroui/react';

export default function RoomStatusChip({ enabled }) {
  switch (enabled) {
    case true:
      return <Chip className="shrink-0 bg-green-100 text-green-700">활성</Chip>;
    case false:
      return <Chip className="shrink-0 bg-neutral-100 text-neutral-600">비활성</Chip>;
    default:
      return;
  }
}
