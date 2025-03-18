import { Divider } from '@heroui/react';

export default function DashboardTitle({ title }) {
  return (
    <div className="mt-5 flex gap-4 overflow-hidden items-center">
      <span className="text-lg font-semibold text-nowrap">{title}</span>
      <Divider className="grow" />
    </div>
  );
}
