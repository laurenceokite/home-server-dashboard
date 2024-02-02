import { ApplicationMonitor, OfflineMonitor } from "../types";

export interface HttpClientRequest {
  url: string;
  method: string;
  body?: any;
  headers?: HeadersInit;
}

export type HttpClientResponse<T> = HttpClientSuccessResponse<T> | HttpClientErrorResponse; 

interface BaseHttpClientResponse {
  ok: boolean;
  status: number;
}

export interface HttpClientSuccessResponse<T> extends BaseHttpClientResponse {
    ok: true;
    data: T;
}

export interface HttpClientErrorResponse extends BaseHttpClientResponse {
    ok: false;
    message: string;
}

export type SSEMessage = SSEInitialize | SSEApplicationStatus; 

type SSEMessageType = "initialize" | "applicationStatus"

interface BaseSSEMessage {
    timestamp: Date;
    type: SSEMessageType;
}

export interface SSEInitialize extends BaseSSEMessage {
    type: "initialize";
    applicationIds: string[];
    latestResults?: (ApplicationMonitor | OfflineMonitor)[];
}

export interface SSEApplicationStatus extends BaseSSEMessage {
    type: "applicationStatus";
    data: (ApplicationMonitor | OfflineMonitor)[];
}


