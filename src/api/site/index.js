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

const SiteClient = {
  findSite,
};
export { SiteClient };
