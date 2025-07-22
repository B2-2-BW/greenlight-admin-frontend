import { Divider } from '@heroui/react';

export default function SectionTitle({ title, first = false, children }) {
  return (
    <>
      <div className="w-full flex flex-col gap-4 p-4 border-1 rounded-lg">
        <div className="font-bold" style={{ marginTop: first ? 0 : '1rem' }}>
          {title}
        </div>
        <Divider className="bg-neutral-200" />
        {children}
      </div>
    </>
  );
}
