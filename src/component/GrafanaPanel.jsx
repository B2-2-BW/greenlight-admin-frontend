import { GRAFANA_INTERNAL_URL } from '../client/config.js';

export default function GrafanaPanel({ path }) {
  const range = () => {
    return `to=now&from=now-10m&refresh=5s&theme=light&timezone=browser&__feature.dashboardSceneSolo`;
  };
  return (
    <div className="w-full h-full">
      <iframe className="w-full h-full" src={GRAFANA_INTERNAL_URL + path.url + range() + path.params}></iframe>
    </div>
  );
}
