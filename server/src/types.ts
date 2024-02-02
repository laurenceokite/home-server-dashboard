export interface Monitor {
    up: boolean;
    uuid: string;
    icon?: string;
    errors?: string[];
    warnings?: string[];
}

export interface DashboardConfiguration {
    applications: ApplicationInstance<any>[]
}

export interface ApplicationInstance<T extends ApplicationMonitor> {
    app: T["app"];
    linkUrl: string;
    baseUrl: string;
    apiKey: string;
    name?: string;
    icon?: string;
    pollInterval?: number;
}

export interface BaseApplicationMonitor extends Monitor, ApplicationInstance<any> {} 

export interface OfflineMonitor extends Monitor {
    up: false;
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
    "Radarr",
    "Sonarr",
    "Qbittorrent",
    "Jellyfin"
}

export interface RadarrMonitor extends BaseApplicationMonitor, DownloadClientMonitor {
    app: ApplicationName.Radarr;
}

export interface SonarrMonitor extends BaseApplicationMonitor, DownloadClientMonitor {
    app: ApplicationName.Sonarr;
}
