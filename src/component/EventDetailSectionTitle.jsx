import { Divider } from '@heroui/react';

export default function EventDetailSectionTitle({ title }) {
  return (
    <>
      <div className="font-bold">{title}</div>
      <Divider className="bg-neutral-200" />
    </>
  );
}
