export type Dashboard = {
    applications: AppMap;
}

export type AppMap = Map<string, ApplicationMonitor | OfflineMonitor>;
export type ApplicationMonitor = RadarrMonitor | SonarrMonitor;

export interface DashboardConfiguration {
    applications: ApplicationInstance<any>[]
}

export interface ApplicationInstance<T extends ApplicationMonitor> {
    app: T["app"];
    baseUrl: string;
    linkUrl?: string;
    apiKey?: string;
    name?: string;
    icon?: string;
    pollIntervalMs?: number;
}

export interface BaseApplicationMonitor extends ApplicationInstance<any> {
    up: boolean;
    uuid: string;
    errors?: string[];
    warnings?: string[];
}

export interface OfflineMonitor extends BaseApplicationMonitor {
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

export enum ApplicationName {
    Radarr = "Radarr",
    Sonarr = "Sonarr",
    Qbittorrent = "Qbittorrent",
    Jellyfin = "Jellyfin"
}

export interface RadarrMonitor extends BaseApplicationMonitor, DownloadClientMonitor {
    app: ApplicationName.Radarr;
}

export interface SonarrMonitor extends BaseApplicationMonitor, DownloadClientMonitor {
    app: ApplicationName.Sonarr;
}


