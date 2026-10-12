import { Separator, Surface } from '@heroui/react';

export default function FormSection({ title, endContent, children }) {
  return (
    <>
      {/*<div className="w-full flex flex-col gap-4 p-4 border rounded-lg bg-white">*/}
      <Surface className="w-full flex flex-col gap-4 p-4 rounded-3xl bg-white" variant="default">
        <div
          className={
            endContent
              ? 'flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1'
              : 'font-bold flex justify-between items-center max-h-6'
          }
        >
          <div className={endContent ? 'text-lg font-bold leading-6' : 'text-lg'}>{title}</div>
          {endContent ? <div className="ml-auto max-w-full">{endContent}</div> : null}
        </div>
        <Separator className="bg-neutral-200" />
        {children}
      </Surface>
      {/*</div>*/}
    </>
  );
}
