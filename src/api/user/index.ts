import { commonAxiosInstance } from '@/src/api';
import { UserRequest, UserResponse } from '@/src/types/user';

//유저 생성
export const createUser = async (body: UserRequest): Promise<any> => {
    const { data } = await commonAxiosInstance.put<UserResponse>(`/users`, body, {});
    return data;
};
