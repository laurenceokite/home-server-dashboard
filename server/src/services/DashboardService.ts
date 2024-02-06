import { ApplicationMonitor, DashboardConfiguration, OfflineMonitor } from "../../../shared/types";
import ApplicationMonitorServiceFactory  from "./applications/ApplicationMonitorServiceFactory";
import ApplicationMonitorService from "./applications/ApplicationMonitorService";
import { AppEventEmitter } from "../events/appEmitter";
import { Response } from "express";
import SSEClientManager from "../http/sseClientManager";
import { SSEInitialize } from "../../../shared/sse.types";

export default class DashboardService {
    private applicationServices: ApplicationMonitorService<any>[] = [];
    private latestResults = new Map<string, ApplicationMonitor | OfflineMonitor>();
    private sseClientManager: SSEClientManager = new SSEClientManager();

    constructor(private config: DashboardConfiguration, private appEmitter: AppEventEmitter) {
        this.initializeServices();
        this.appEmitter.onStatusUpdate(this.handleApplicationStatusUpdate.bind(this));
    }

    private initializeServices() {
        for (const instanceConfig of this.config.applications) {
            const service = ApplicationMonitorServiceFactory.createService(instanceConfig, this.appEmitter);
            this.applicationServices.push(service);
        }
    }
    
    handleNewClient(client: Response) {
        const initMessage: SSEInitialize = {
            type: "initialize",
            timestamp: new Date(),
            latestResults: this.latestResults,
        }

        this.sseClientManager.addClient(
            client, 
            initMessage        
        );

        this.applicationServices.forEach(service => service.startPoll());
    }

    handleClientDisconnect(client: Response) {
        this.sseClientManager.removeClient(client);
        
        if (!this.sseClientManager.hasClients()) {
            this.applicationServices.forEach(service => service.stopPoll());
        }
    }

    handleApplicationStatusUpdate(monitor: ApplicationMonitor | OfflineMonitor) {
        this.latestResults.set(monitor.uuid, monitor);

        this.sseClientManager.sendToAll({
            type: "applicationStatus",
            timestamp: new Date(),
            data: [monitor]
        })
    } 
}
