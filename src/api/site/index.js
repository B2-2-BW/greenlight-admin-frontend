// 유저 생성
import { commonAxiosInstance, publicAxiosInstance } from '../index.js';

const findSite = async (siteId) => {
  return await publicAxiosInstance.get(`/sites/${siteId}`).then(
    (response) => response,
    (error) => {
      return error.response;
    }
  );
};

const updateSiteInfo = async (siteId, data) => {
  return await commonAxiosInstance.put(`/sites/${siteId}`, data);
};

const getSites = ({ page = 1, size = 10, query = '', enabled, signal } = {}) =>
  commonAxiosInstance.get('/sites', {
    params: {
      page,
      size,
      ...(query.trim() ? { query: query.trim() } : {}),
      ...(enabled === undefined ? {} : { enabled }),
    },
    signal,
  });

const getManagedSite = (siteId) => commonAxiosInstance.get(`/sites/${siteId}/manage`);

const rotateSiteApiKey = (siteId) => commonAxiosInstance.post(`/sites/${siteId}/api-key/rotate`);

const syncAllSiteData = async () => {
  return await commonAxiosInstance.post('/sites/cache');
};

const SiteClient = {
  findSite,
  updateSiteInfo,
  getSites,
  getManagedSite,
  rotateSiteApiKey,
  syncAllSiteData,
};
export { SiteClient };
