import { ApplicationMonitor, OfflineMonitor, AppMap } from "./types";

export type SSEMessage = SSEInitialize | SSEApplicationStatus; 

type SSEMessageType = "initialize" | "applicationStatus"

interface BaseSSEMessage {
    timestamp: Date;
    type: SSEMessageType;
}

export interface SSEInitialize extends BaseSSEMessage {
    type: "initialize";
    latestResults: AppMap;
}

export interface SSEApplicationStatus extends BaseSSEMessage {
    type: "applicationStatus";
    data: (ApplicationMonitor | OfflineMonitor)[];
}
