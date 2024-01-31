interface BaseApplicationMonitor {
    app: ApplicationName;
    url: string;
    up: boolean;
    uniqueName?: string;
    icon?: string;
    errors?: string[];
    warnings?: string[];
}

export interface OfflineMonitor extends BaseApplicationMonitor {
    up: false;
}

export interface OnlineMonitor extends BaseApplicationMonitor {
    up: true;
}

type UnionToIntersection<U> = 
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

type ApplicationMonitorWithExtensions<N extends ApplicationName, T extends any[]> = 
    { app: N } & BaseApplicationMonitor & (OfflineMonitor | OnlineMonitor & UnionToIntersection<T[number]>);

export interface ApplicationMonitorService<T extends ApplicationMonitor> {
    getStatus(): Promise<T | OfflineMonitor>;
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

export type RadarrMonitor = ApplicationMonitorWithExtensions<ApplicationName.Radarr, [DownloadClientMonitor]>;
