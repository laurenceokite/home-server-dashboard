import { HttpClient } from "../../http/HttpClient";
import type { 
    ApplicationFolderStatus,  
    ApplicationQueueStatus,  
    RadarrMonitor, 
    OfflineMonitor, 
    ApplicationInstance 
} from "../../../../shared/types";
import ApplicationMonitorService from "./ApplicationMonitorService";
import { AppEventEmitter } from "../../events/appEmitter";

import type { DiskSpaceResponse, HealthResponse, QueueStatusResponse, RootFolderResponse } from "./radarr.types";

export default class RadarrService extends ApplicationMonitorService<RadarrMonitor> {
    readonly icon = "movie-roll";
    private readonly httpClient: HttpClient;

    constructor(private instance: ApplicationInstance<RadarrMonitor>, emitter: AppEventEmitter) {
        super(emitter, instance.pollIntervalMs);

        const headers: HeadersInit = {};

        if (this.instance.apiKey) {
            const apiKeyHeader = { "X-Api-Key": this.instance.apiKey };
            Object.assign(headers, apiKeyHeader);
        }

        this.httpClient = new HttpClient(instance.baseUrl, headers);
    }

    async getStatus(): Promise<RadarrMonitor | OfflineMonitor> {
        const errors: string[] = [];
        const warnings: string[] = [];

        const up = await this.ping();

        if (!up) {
            return {
                up,
                uuid: this.uuid,
                ...this.instance,
                icon: this.instance.icon ?? this.icon,
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
            uuid: this.uuid,
            ...this.instance,
            icon: this.icon,
            queued,
            rootFolders,
            errors,
            warnings,
        };

        return status;
    }

    async ping(): Promise<boolean> {
        const response = await this.httpClient.get("ping");
        return response.ok && response.status == 200;
    }

    async getQueueStatus(): Promise<[ApplicationQueueStatus, string | null]> {
        const status: ApplicationQueueStatus = {
            total: 0,
            hasErrors: true,
        };

        const response = await this.httpClient.get<QueueStatusResponse>("api/v3/queue/status");
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

        const folderResponse = await this.httpClient.get<RootFolderResponse[]>("api/v3/rootfolder");
        if (!folderResponse.ok) {
            const placeholder: ApplicationFolderStatus = {
                path: "unknown",
            };

            status.push(placeholder);
            return [status, "Error retreiving root folder status."];
        }

        folderResponse.data.forEach(response => status.push(this.folderResponseToStatus(response)));

        const diskSpaceResponse = await this.httpClient.get<DiskSpaceResponse[]>("api/v3/diskspace");
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
        const response = await this.httpClient.get<HealthResponse[]>("api/v3/health");

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
