import { commonAxiosInstance, coreAxiosInstance } from '../index.js';
import axios from 'axios'; // axios 별도 임포트 필요 (S3 직접 업로드용)

// 단일 액션그룹 정보 조회
const getActionGroupById = async (actionGroupId) => {
  const { data } = await commonAxiosInstance.get(`/action-groups/${actionGroupId}`);
  return data;
};

// 액션그룹 리스트 정보 조회
const getActionGroupList = async (query) => {
  const { data } = await commonAxiosInstance.get(`/action-groups`, { params: query });
  return data;
};

const createAction = async (actionGroupId, data) => {
  return commonAxiosInstance.post(`/action-groups/${actionGroupId}/actions`, data);
};

const createActionGroup = async (data) => {
  return commonAxiosInstance.post(`/action-groups`, data);
};

const updateActionGroupById = async (actionGroupId, data) => {
  return commonAxiosInstance.put(`/action-groups/${actionGroupId}`, data);
};

const deleteActionGroupById = async (actionGroupId) => {
  return commonAxiosInstance.delete(`/action-groups/${actionGroupId}`);
};

// [추가] Presigned URL 발급 요청 (백엔드 구현 필요)
const getPresignedUploadUrl = async (filename) => {
  // 예시: /support/presigned-url?filename=image.png
  // 백엔드 구현에 따라 URL은 달라질 수 있습니다.
  const { data } = await commonAxiosInstance.get(`/support/presigned-url`, {
    params: { filename },
  });
  return data; // { presignedUrl: "...", fileUrl: "https://s3..." } 형태 가정
};

// [추가] S3로 파일 직접 업로드
const uploadFileToS3 = async (presignedUrl, file) => {
  await axios.put(presignedUrl, file, {
    headers: {
      'Content-Type': file.type,
    },
  });
};

const ActionGroupClient = {
  getActionGroupById,
  getActionGroupList,
  createAction,
  createActionGroup,
  updateActionGroupById,
  deleteActionGroupById,
  getPresignedUploadUrl, // export 추가
  uploadFileToS3,        // export 추가
};

export { ActionGroupClient };
