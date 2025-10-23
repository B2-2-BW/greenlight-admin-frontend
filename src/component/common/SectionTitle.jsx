import { Divider } from '@heroui/react';

export default function SectionTitle({ title, endContent, children }) {
  return (
    <>
      <div className="w-full flex flex-col gap-4 p-4 border-1 rounded-lg bg-white">
        <div className="font-bold flex justify-between items-center max-h-[24px]">
          <div className="text-lg">{title}</div>
          {endContent && <div> {endContent} </div>}
        </div>
        <Divider className="bg-neutral-200" />
        {children}
      </div>
    </>
  );
}
