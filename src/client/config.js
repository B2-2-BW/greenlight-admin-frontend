export const GRAFANA_EXTERNAL_URL = import.meta.env.VITE_GRAFANA_EXTERNAL_URL;
export const JENKINS_EXTERNAL_URL = import.meta.env.VITE_JENKINS_EXTERNAL_URL;

export const ENVIRONMENT_LABEL = {
  dev: 'DEV',
  development: 'LOCAL',
}[import.meta.env.MODE];
