export interface Monitor {
    up: boolean;
    icon?: string;
    errors?: string[];
    warnings?: string[];
}

export interface ApplicationInstance { 
    app: ApplicationName;
    linkUrl: string;
    baseUrl: string;
    name?: string;
}

export interface BaseApplicationMonitor extends Monitor, ApplicationInstance {} 

export interface OfflineMonitor extends Monitor {
    up: false;
}

export interface ApplicationMonitorService<T extends ApplicationMonitor> {
    getStatus(instance: ApplicationInstance, apiKey?: string): Promise<T | OfflineMonitor>;
}

export type ApplicationStatusResponse<T> = ApplicationStatusSuccess<T> | ApplicationStatusWithErrors<T>;

export interface BaseApplicationStatusResponse<T> {
    hasErrors: boolean;
    data: T | Partial<T>;
}

export interface ApplicationStatusSuccess<T> extends BaseApplicationStatusResponse<T> {
    hasErrors: false;
    data: T;
}

export interface ApplicationStatusWithErrors<T> extends BaseApplicationStatusResponse<T> {
    hasErrors: true;
    data: Partial<T>
    errors: string[];
}

export interface ApplicationQueueStatus {
    total: number;
    inProgress?: number;
    hasErrors: boolean;
}

export interface ApplicationFolderStatus {
    path: string;
    totalBytes?: number; 
    freeBytes?: number;
}

export interface DownloadClientMonitor {
    queued: ApplicationQueueStatus;
    rootFolders: ApplicationFolderStatus[]; 
}

export type ApplicationMonitor = RadarrMonitor; // Other monitors will go here in a union

export enum ApplicationName {
    "Radarr"
    // Enums here will match application monitors and be used for discrimination
}

export interface RadarrMonitor extends BaseApplicationMonitor, DownloadClientMonitor {
    app: ApplicationName.Radarr;
}
