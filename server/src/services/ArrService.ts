import { HttpClient } from "../http/HttpClient";
import { ApplicationName, type ApplicationFolderStatus, type ApplicationMonitorService, type ApplicationQueueStatus, type RadarrMonitor, OfflineMonitor, ApplicationInstance, ApplicationStatusResponse } from "../types";
import type { DiskSpaceResponse, HealthResponse, QueueStatusResponse, RootFolderResponse } from "./radarr.types";

export class ArrService extends HttpClient implements ApplicationMonitorService<ArrMonitor> {
    readonly metadata: {
        app: ApplicationName,
        icon: string
    };

    constructor(private instance: ApplicationInstance, headers: HeadersInit) {
        super(instance.baseUrl, headers);

        if (instance.app == ApplicationName.Radarr) {
            this.metadata = {
                app: instance.app,
                icon: "movie-roll"
            }

        } else if (instance.app == ApplicationName.Sonarr) {
            this.metadata = {
                app: instance.app,
                icon: "television-classic"
            }

        } else {
            throw new Error(`${instance.app} instance cannot be used in ArrService constructor`)
        }

    }

    async getStatus(): Promise<ArrMonitor | OfflineMonitor> {
        const errors: string[] = [];
        const warnings: string[] = [];

        const up = await this.ping();

        if (!up) {
            return {
                up,
                ...this.metadata,
                ...this.instance,
                errors: ['Could not connect to Radarr server.'],
            }
        }

        const [queued, queueError] = await this.getQueueStatus();
        if (queueError) {
            errors.push(queueError);
        }
       
        const [rootFolders, folderError] = await this.getRootFolderStatus();
        if (folderError) {
            errors.push(folderError);
        }

        await this.healthCheck(errors, warnings);

        const status: RadarrMonitor = {
            up,
            ...this.metadata,
            ...this.instance,
            queued,
            rootFolders,
            errors,
            warnings,
        };

        return status;
    }

    async ping(): Promise<boolean> {
        const response = await this.get("ping");
        return response.ok && response.status == 200;
    }

    async getQueueStatus(): Promise<[ApplicationQueueStatus, string | null]> {
        const status: ApplicationQueueStatus = {
            total: 0,
            hasErrors: true,
        };

        const response = await this.get<QueueStatusResponse>("api/v3/queue/status");
        if (!response.ok) {
            return [
                status, 
                "Error retrieving queue status."
            ];
        }

        status.total = response.data.totalCount;
        status.hasErrors = response.data.errors;

        return [status, null];
    }

    async getRootFolderStatus(): Promise<[ApplicationFolderStatus[], string | null]> {
        const status: ApplicationFolderStatus[] = [];

        const folderResponse = await this.get<RootFolderResponse[]>("api/v3/rootfolder");
        if (!folderResponse.ok) {
            const placeholder: ApplicationFolderStatus = {
                path: "unknown",
            };

            status.push(placeholder);
            return [status, "Error retreiving root folder status."];
        }

        folderResponse.data.forEach(response => status.push(this.folderResponseToStatus(response)));

        const diskSpaceResponse = await this.get<DiskSpaceResponse[]>("api/v3/diskspace");
        if (!diskSpaceResponse.ok) {
            return [status, "Error retrieving disk space."];
        }

        const diskResponseMap = diskSpaceResponse.data.reduce(
            (map, response) => map.set(response.path, response), 
            new Map<string, DiskSpaceResponse>()
        );

        status.forEach(folder => { 
            folder.totalBytes = diskResponseMap.get(folder.path)?.totalSpace ?? undefined
        });

        return [status, null];
    }

    async healthCheck(errors: string[], warnings: string[]): Promise<void> {
        const response = await this.get<HealthResponse[]>("api/v3/health");

        if (!response.ok) {
            errors.push("Error while retrieving... errors.");
            return;
        }

        response.data.forEach(resource => {
            if (resource.type === "error") {
                errors.push(resource.message);
            }

            if (resource.type === "warning") {
                warnings.push(resource.message);
            }
        });
    }

    private folderResponseToStatus(response: RootFolderResponse): ApplicationFolderStatus {
        return {
            path: response.path,
            freeBytes: response.freeSpace,
        }
    }

}
