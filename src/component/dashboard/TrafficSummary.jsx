import { Card, CardBody, CardHeader, CircularProgress } from '@heroui/react';
import { NumberUtil } from '../../util/numberUtil.js';
import { DateUtil } from '../../util/dateUtil.jsx';

export default function TrafficSummary({ isLoading = false, trafficSummary }) {
  return (
    <div className="flex gap-5 items-end relative">
      {isLoading && (
        <>
          <div className="absolute inset-0 w-[1000px] flex z-[1000] items-center justify-center">
            <CircularProgress
              aria-label="Loading..."
              size="lg"
              strokeWidth={4}
              classNames={{ track: 'stroke-white' }}
            />
          </div>
          <div className="absolute inset-0 w-[1000px] z-[999] rounded-xl bg-neutral-400 opacity-30"></div>
        </>
      )}
      <Card className="border-[#20814C] border-2">
        <CardHeader>
          <p className="text-base uppercase font-bold">동시접속자</p>
        </CardHeader>
        <CardBody>
          <div className="min-w-32 h-16 flex justify-end items-end">
            <div>
              <span className="text-4xl leading-none font-semibold">
                {NumberUtil.formatNumber(trafficSummary?.concurrentUser)}
              </span>
              <span className="text-base text-neutral-600">명</span>
            </div>
          </div>
        </CardBody>
      </Card>
      <Card className="border-2">
        <CardHeader className="flex-col items-start">
          <p className="text-base uppercase font-bold">대기 요청</p>
        </CardHeader>
        <CardBody>
          <div className="min-w-32 h-16 flex justify-end items-end">
            <span className="text-4xl leading-none font-semibold">
              {NumberUtil.formatNumber(trafficSummary?.requestCount)}
            </span>
            <span className="text-base text-neutral-600">/초</span>
          </div>
        </CardBody>
      </Card>
      <Card className="border-2">
        <CardHeader className="flex-col items-start">
          <p className="text-base uppercase font-bold">전체 대기인원</p>
        </CardHeader>
        <CardBody>
          <div className="min-w-32 h-16 flex justify-end items-end">
            <span className="text-4xl leading-none font-semibold">
              {NumberUtil.formatNumber(trafficSummary?.waitingCount)}
            </span>
            <span className="text-base text-neutral-600">명</span>
          </div>
        </CardBody>
      </Card>
      <Card className="border-2">
        <CardHeader className="flex-col items-start">
          <p className="text-base uppercase font-bold">총 입장인원</p>
        </CardHeader>
        <CardBody>
          <div className="min-w-32 h-16 flex justify-end items-end">
            <span className="text-4xl leading-none font-semibold">
              {NumberUtil.formatNumber(trafficSummary?.enteredCount)}
            </span>
            <span className="text-base text-neutral-600">/초</span>
          </div>
        </CardBody>
      </Card>
      <div className="flex gap-2 text-base items-end text-neutral-400">
        <span>측정기준:</span>
        <span>{DateUtil.timestampToDateTime(trafficSummary?.timestamp)}</span>
      </div>
    </div>
  );
}
