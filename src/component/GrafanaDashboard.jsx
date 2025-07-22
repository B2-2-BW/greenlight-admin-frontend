import GrafanaPanel from './GrafanaPanel.jsx';
import { Card, CardBody, CardHeader } from '@heroui/react';
import DashboardTitle from './DashboardTitle.jsx';

const embedLinks = {
  springCoreLog: {
    url: '/d-solo/dLsDQIUnzb/spring-core-api-eb8c80-ec8b9c-ebb3b4-eb939c?',
    params: 'orgId=1&var-app_name=&var-log_keyword=&showCategory=Panel%20links&tab=queries&panelId=2',
  },
  cpuBusy: {
    url: '/d-solo/rYdddlPWk/ec849c-ebb284-eb8c80-ec8b9c-ebb3b4-eb939c?',
    params:
      'orgId=1&var-datasource=default&var-job=node-exporter&var-node=greenlight-core-server&var-diskdevices=%5Ba-z%5D%2B%7Cnvme%5B0-9%5D%2Bn%5B0-9%5D%2B%7Cmmcblk%5B0-9%5D%2B&panelId=20',
  },
  pressure: {
    url: '/d-solo/rYdddlPWk/ec849c-ebb284-eb8c80-ec8b9c-ebb3b4-eb939c?',
    params:
      'orgId=1&var-datasource=default&var-job=node-exporter&var-node=greenlight-core-server&var-diskdevices=%5Ba-z%5D%2B%7Cnvme%5B0-9%5D%2Bn%5B0-9%5D%2B%7Cmmcblk%5B0-9%5D%2B&panelId=323',
  },
  ramUsed: {
    url: '/d-solo/rYdddlPWk/ec849c-ebb284-eb8c80-ec8b9c-ebb3b4-eb939c?',
    params:
      'orgId=1&var-datasource=default&var-job=node-exporter&var-node=greenlight-core-server&var-diskdevices=%5Ba-z%5D%2B%7Cnvme%5B0-9%5D%2Bn%5B0-9%5D%2B%7Cmmcblk%5B0-9%5D%2B&panelId=16',
  },
  springCoreRps: {
    url: '/d-solo/dLsDQIUnzb/spring-core-api-eb8c80-ec8b9c-ebb3b4-eb939c?',
    params: 'orgId=1&var-app_name=&var-log_keyword=&showCategory=Standard%20options&panelId=12',
  },
  springCoreAverageResponseTime: {
    url: '/d-solo/dLsDQIUnzb/spring-core-api-eb8c80-ec8b9c-ebb3b4-eb939c?',
    params: 'orgId=1&var-app_name=&var-log_keyword=&showCategory=Standard%20options&panelId=6',
  },
  redisFlow: {
    url: '/d-solo/bRd48yKMdd/redis-eb8c80-ec8b9c-ebb3b4-eb939c?',
    params: 'orgId=1&var-instance=greenlight-core-redis&var-datasource=dee7crsq7ifwgb&panelId=31',
  },
  springCoreP95: {
    url: '/d-solo/dLsDQIUnzb/spring-core-api-eb8c80-ec8b9c-ebb3b4-eb939c?',
    params: 'orgId=1&var-app_name=&var-log_keyword=&panelId=23',
  },
  springCoreP99: {
    url: '/d-solo/dLsDQIUnzb/spring-core-api-eb8c80-ec8b9c-ebb3b4-eb939c?',
    params: 'orgId=1&var-app_name=&var-log_keyword=&panelId=8',
  },
};

export default function GrafanaDashboard() {
  return (
    <>
      <div className="flex flex-col gap-4">
        <DashboardTitle title="서버 통계 (Core API)" />
        <Card shadow="sm">
          <CardBody className="flex flex-col gap-2 w-full">
            <div className="flex gap-2 w-full">
              <GrafanaPanel path={embedLinks.pressure} />
              <GrafanaPanel path={embedLinks.cpuBusy} />
              <GrafanaPanel path={embedLinks.ramUsed} />
            </div>
          </CardBody>
        </Card>

        <DashboardTitle title="사용자 유입량" />
        <Card shadow="sm">
          <CardBody className="flex flex-col gap-2 w-full">
            <div className="flex gap-2 w-full h-[200px]">
              <GrafanaPanel path={embedLinks.springCoreRps} />
              <GrafanaPanel path={embedLinks.redisFlow} />
            </div>
          </CardBody>
        </Card>
        <DashboardTitle title="API 성능" />
        <Card shadow="sm">
          <CardBody className="flex flex-col gap-2 w-full">
            <div className="flex gap-2 w-full h-[200px]">
              <GrafanaPanel path={embedLinks.springCoreP95} />
              <GrafanaPanel path={embedLinks.springCoreP99} />
            </div>
            <div className="h-[120px]">
              <GrafanaPanel path={embedLinks.springCoreAverageResponseTime} />
            </div>
            <div className="h-[280px]">
              <GrafanaPanel path={embedLinks.springCoreLog} />
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
