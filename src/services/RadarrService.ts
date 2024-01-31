import { HttpClient } from "@/http/HttpClient";
import { ApplicationName, type ApplicationFolderStatus, type ApplicationMonitorService, type ApplicationQueueStatus, type RadarrMonitor } from "@/types";
import type { DiskSpaceResponse, HealthResponse, QueueStatusResponse, RootFolderResponse } from "./radarr.types";

export class RadarrService extends HttpClient implements ApplicationMonitorService<RadarrMonitor> {
    private readonly metadata = {
        app: ApplicationName.Radarr,
        url: "http://movies.okite.casa/",
        icon: "movie-roll"
    } as const;

    private errors: string[] = [];
    private warnings: string[] = [];

    constructor() {
        super(import.meta.env.VITE_RADARR_URL ?? "", {
            "X-Api-Key": import.meta.env.VITE_RADARR_KEY ?? "",
        })
    }

    async getStatus(): Promise<RadarrMonitor> {
        this.errors = [];
        this.warnings = [];

        const up = await this.ping();

        if (!up) {
            return {
                up,
                ...this.metadata,
                errors: this.errors,
            }
        }

        const queued = await this.getQueueStatus();
        const rootFolders = await this.getRootFolderStatus();
        const [errors, warnings] = await this.healthCheck();

        const status: RadarrMonitor = {
            up,
            ...this.metadata,
            queued,
            rootFolders,
            errors: [ ...errors, ...this.errors],
            warnings: [ ...warnings, ...this.warnings]
        };

        return status;
    }

    private async ping(): Promise<boolean> {
        const response = await this.get("ping");
        if (response.ok && response.status == 200) {
            return true;
        } else {
            this.errors.push("Could not connect to Radarr.");
            return false;
        }
    }

    private async getQueueStatus(): Promise<ApplicationQueueStatus> {
        const status: ApplicationQueueStatus = {
            total: 0,
            hasErrors: true,
        };

        const response = await this.get<QueueStatusResponse>("api/v3/queue/status");
        if (!response.ok) {
            this.errors.push("Error retrieving queue status.");  
            return status;
        }

        status.total = response.data.totalCount;
        status.hasErrors = response.data.errors;

        return status;
    }

    private async getRootFolderStatus(): Promise<ApplicationFolderStatus[]> {
        const status: ApplicationFolderStatus[] = [];

        const folderResponse = await this.get<RootFolderResponse[]>("api/v3/rootfolder");
        if (!folderResponse.ok) {
            const placeholder: ApplicationFolderStatus = {
                path: "unknown",
            };

            status.push(placeholder);
            this.errors.push("Error retreiving root folder status.");

            return status;
        }

        folderResponse.data.forEach(response => status.push(this.folderResponseToStatus(response)));

        const diskSpaceResponse = await this.get<DiskSpaceResponse[]>("api/v3/diskspace");
        if (!diskSpaceResponse.ok) {
            this.errors.push("Error retrieving disk space.");
            return status;
        }

        const diskResponseMap = diskSpaceResponse.data.reduce(
            (map, response) => map.set(response.path, response), 
            new Map<string, DiskSpaceResponse>()
        );

        status.forEach(folder => { 
            folder.totalBytes = diskResponseMap.get(folder.path)?.totalSpace ?? undefined
        });

        return status;
    }

    private async healthCheck(): Promise<[errors: string[], warnings: string[]]> {
        const response = await this.get<HealthResponse[]>("api/v3/health");
        const errors: string[] = [];
        const warnings: string[] = [];

        if (!response.ok) {
            errors.push("Error while retrieving... errors.")
            return [errors, warnings];
        }

        response.data.forEach(resource => {
            if (resource.type === "error") {
                errors.push(resource.message);
            }

            if (resource.type === "warning") {
                warnings.push(resource.message)
            }
        });

        return [errors, warnings];
    }

    private folderResponseToStatus(response: RootFolderResponse): ApplicationFolderStatus {
        return {
            path: response.path,
            freeBytes: response.freeSpace,
        }
    }

}
