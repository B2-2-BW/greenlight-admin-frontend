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

const SiteClient = {
  findSite,
  updateSiteInfo,
};
export { SiteClient };
