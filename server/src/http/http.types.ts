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




