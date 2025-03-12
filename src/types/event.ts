export interface EventUpdateRequest {
    eventDescription: string;
    eventType: string;
    eventUrl: string;
    queueBackpressure: number;
    eventStartTime: string;
    eventEndTime: string;
    updatedBy: string;
}

export interface Event {
    eventSeq: number;
    eventName: string;
    eventDescription: string;
    eventType: string;
    eventUrl: string;
    queueBackpressure: number;
    eventStartTime: string;
    eventEndTime: string;
    createdBy: string;
    createdAt: string;
    updatedBy: string;
    updatedAt: string;
}

export interface EventRequest {
    eventName: string;
    eventDescription: string;
    eventType: string;
    eventUrl: string;
    queueBackpressure: number;
    eventStartTime: string;
    eventEndTime: string;
    createdBy: string;
    updatedBy: string;
}
  
export interface EventCacheResponse {
    refreshCount: number;
}

export interface EventListResponse {
    event: Event[];
}

export interface CreateEventsRequest {
    eventName: string;
    eventDescription: string;
    eventType: string;
    eventUrl: string;
    queueBackpressure: number;
    eventStartTime: string;
    eventEndTime: string;
    createdBy: string;
    updatedBy: string;
}