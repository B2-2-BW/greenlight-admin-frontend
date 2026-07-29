import { Card, Skeleton } from '@heroui/react';

function SkeletonCard({ className = '' }) {
  return (
    <Card className={`min-w-0 ${className}`}>
      <Card.Content className="space-y-4 p-4">
        <Skeleton className="h-5 w-32 rounded" />
        <Skeleton className="h-8 w-20 rounded" />
      </Card.Content>
    </Card>
  );
}

export default function QueueStatisticsSkeleton({ includeFilter = true }) {
  const content = (
    <>
      <section className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="대기열 핵심 지표 로딩 중">
        {[0, 1, 2, 3].map((item) => (
          <SkeletonCard key={item} />
        ))}
      </section>
      <section className="grid gap-4">
        <SkeletonCard className="h-72" />
        <div className="grid gap-4 xl:grid-cols-2">
          <SkeletonCard className="h-80" />
          <SkeletonCard className="h-80" />
        </div>
      </section>
      <SkeletonCard className="mt-4 h-64" />
    </>
  );

  if (!includeFilter)
    return (
      <div aria-busy="true" aria-live="polite">
        {content}
      </div>
    );

  return (
    <main className="w-full min-w-0 max-w-[1080px] p-4 sm:p-6" aria-busy="true" aria-live="polite">
      <h1 className="mb-4 mt-4 text-2xl font-bold sm:mt-8 sm:text-3xl">대기열 통계</h1>
      <Card className="mb-4">
        <Card.Content className="grid gap-x-3 gap-y-1 p-4 lg:grid-cols-[minmax(0,26rem)_minmax(0,14rem)_auto] lg:items-end">
          <div className="min-w-0 lg:col-start-1 lg:row-start-1">
            <span className="text-sm font-medium">기간</span>
            <Skeleton className="h-10 w-full rounded" />
          </div>
          <Skeleton className="h-4 w-80 rounded lg:col-start-1 lg:row-start-2" />
          <div className="min-w-0 lg:col-start-2 lg:row-start-1">
            <span className="mb-1 block text-sm font-medium">Room</span>
            <Skeleton className="h-10 w-full rounded" />
          </div>
          <Skeleton className="h-10 w-full sm:w-16 lg:col-start-3 lg:row-start-1" />
        </Card.Content>
      </Card>
      {content}
    </main>
  );
}
