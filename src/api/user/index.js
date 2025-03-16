import { commonAxiosInstance } from '@/src/api';

// 유저 생성
export const createUser = async (body) => {
    const { data } = await commonAxiosInstance.put(`/users`, body, {});
    return data;
};
