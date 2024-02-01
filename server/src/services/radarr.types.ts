export interface RootFolderResponse {
    id: number;
    path: string;
    accessible: boolean;
    freeSpace: number;
    unmappedFolders: [
        {
            name: string;
            path: string;
        }
    ]
}

export interface QueueStatusResponse {
    id: number;
    totalCount: number;
    count: number;
    unknownCount: number;
    errors: boolean;
    warnings: boolean;
    unknownErrors: boolean;
    unknownWarnings: boolean;
}

export interface DiskSpaceResponse {
    id: number;
    path: string;
    label: string;
    freeSpace: number;
    totalSpace: number;
}

export interface HealthResponse {
    id: number;
    source: string;
    type: "ok" | "notice" | "warning" | "error";
    message: string;
}



