import { commonAxiosInstance } from '@/src/api';
import { CreateEventsRequest, Event, EventCacheResponse, EventListResponse } from '@/src/types/event';

//단일 이벤트 정보 조회
export const getEventInfo = async (eventName: string): Promise<any> => {
  const { data } = await commonAxiosInstance.get<Event>(`/events/${eventName}`);
  return data;
};

//이벤트 정보 업데이트
export const updateEventInfo = async (eventName: string): Promise<any> => {
    const { data } = await commonAxiosInstance.put<Event>(`/events/${eventName}`);
    return data;
};

//이벤트 삭제
export const deleteEventInfo = async (eventName: string): Promise<any> => {
    const { data } = await commonAxiosInstance.delete(`/events/${eventName}`);
    return data;
};

//이벤트 리스트 정보 조회
export const getEventList = async (): Promise<any> => {
    const { data } = await commonAxiosInstance.put<EventListResponse>(`/events`);
    return data;
};

//이벤트 생성
export const createEvent = async (body: CreateEventsRequest): Promise<any> => {
    const { data } = await commonAxiosInstance.put<Event>(`/events`, body, {});
    return data;
};

//캐시 초기화
export const requestEventsCacheReload = async (): Promise<any> => {
    const { data } = await commonAxiosInstance.put<EventCacheResponse>(`/events/cache/reload`);
    return data;
};

