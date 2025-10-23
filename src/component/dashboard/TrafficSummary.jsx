import { Button, Card, CardBody, CardHeader, CircularProgress, Tooltip } from '@heroui/react';
import { NumberUtil } from '../../util/numberUtil.js';
import { DateUtil } from '../../util/dateUtil.jsx';
import { QuestionCircleOutlined } from '../../icon/Icons.jsx';

function SummaryTooltip({ title, content }) {
  return (
    <Tooltip
      content={
        <div className="px-2 py-2 flex flex-col">
          <span className="text-lg font-semibold">{title}</span>
          <span className="text-base">{content}</span>
        </div>
      }
      closeDelay={200}
      placement="top-start"
    >
      <div className="cursor-pointer px-2 py-1">
        <QuestionCircleOutlined color={'#919191'} size={18} />
      </div>
    </Tooltip>
  );
}

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
          <SummaryTooltip title="동시접속자" content="최근 5분 동안 접속한 고유 사용자 수" />
        </CardHeader>
        <CardBody>
          <div className="min-w-32 h-16 flex justify-end items-end">
            <div>
              <span className="text-4xl leading-none font-semibold mr-[2px]">
                {NumberUtil.formatNumber(trafficSummary?.sessionCount)}
              </span>
              <span className="text-base text-neutral-600">명</span>
            </div>
          </div>
        </CardBody>
      </Card>
      <Card className="border-2">
        <CardHeader>
          <p className="text-base uppercase font-bold">대기 요청</p>
          <SummaryTooltip title="대기 요청" content="유량제어 서버에서 측정된 실시간 요청 수 (10초 평균)" />
        </CardHeader>
        <CardBody>
          <div className="min-w-32 h-16 flex justify-end items-end">
            <span className="text-4xl leading-none font-semibold mr-[2px]">
              {NumberUtil.formatNumber(trafficSummary?.averageRequestCount)}
            </span>
            <span className="text-base text-neutral-600">/초</span>
          </div>
        </CardBody>
      </Card>
      <Card className="border-2">
        <CardHeader>
          <p className="text-base uppercase font-bold">대기인원</p>
          <SummaryTooltip title="대기인원" content="현재 대기열에서 기다리는 전체 고객 수" />
        </CardHeader>
        <CardBody>
          <div className="min-w-32 h-16 flex justify-end items-end">
            <span className="text-4xl leading-none font-semibold mr-[2px]">
              {NumberUtil.formatNumber(trafficSummary?.waitingCount)}
            </span>
            <span className="text-base text-neutral-600">명</span>
          </div>
        </CardBody>
      </Card>
      <Card className="border-2">
        <CardHeader>
          <p className="text-base uppercase font-bold">입장인원</p>
          <SummaryTooltip title="입장인원" content="유량제어 서버에서 측정된 실시간 입장 인원 수 (10초 평균)" />
        </CardHeader>
        <CardBody>
          <div className="min-w-32 h-16 flex justify-end items-end">
            <span className="text-4xl leading-none font-semibold mr-[2px]">
              {NumberUtil.formatNumber(trafficSummary?.averageEnteredCount)}
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
