import { Card, CardBody, CardHeader } from '@heroui/react';
import { NumberUtil } from '../../util/numberUtil.js';
import { DateUtil } from '../../util/dateUtil.jsx';

export default function TrafficSummary({ activeCustomerCount, trafficSummary }) {
  return (
    <div className="flex gap-5 items-end">
      <Card className="border-[#20814C] border-2">
        <CardHeader>
          <p className="text-base uppercase font-bold">동시접속자</p>
        </CardHeader>
        <CardBody>
          <div className="w-28 h-16 flex justify-end items-end mr-2">
            <span className="text-3xl">{NumberUtil.formatNumber(activeCustomerCount)}</span>
            <span className="text-sm text-neutral-600">/초</span>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader className="flex-col items-start">
          <p className="text-base uppercase font-bold">대기 요청</p>
        </CardHeader>
        <CardBody>
          <div className="w-28 h-16 flex justify-end items-end mr-2">
            <span className="text-3xl">{NumberUtil.formatNumber(trafficSummary?.requestCount)}</span>
            <span className="text-sm text-neutral-600">/초</span>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader className="flex-col items-start">
          <p className="text-base uppercase font-bold">전체 대기인원</p>
        </CardHeader>
        <CardBody>
          <div className="w-28 h-16 flex justify-end items-end mr-2">
            <span className="text-3xl">{NumberUtil.formatNumber(trafficSummary?.waitingCount)}</span>
            <span className="text-sm text-neutral-600">명</span>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader className="flex-col items-start">
          <p className="text-base uppercase font-bold">총 입장인원</p>
        </CardHeader>
        <CardBody>
          <div className="w-28 h-16 flex justify-end items-end mr-2">
            <span className="text-3xl">{NumberUtil.formatNumber(trafficSummary?.enteredCount)}</span>
            <span className="text-sm text-neutral-600">/초</span>
          </div>
        </CardBody>
      </Card>
      <div className="flex gap-2 text-xs items-end text-neutral-400">
        <span>측정기준:</span>
        <span>{DateUtil.timestampToDateTime(trafficSummary?.timestamp)}</span>
      </div>
    </div>
  );
}
