import { ApplicationMonitor, OfflineMonitor } from "../../types";
import { AppEventEmitter } from "../../events/appEmitter";
import { v4 as uuid } from "uuid"; 

export default abstract class ApplicationMonitorService<T extends ApplicationMonitor> {
    abstract getStatus(): Promise<T | OfflineMonitor>;  
    private intervalId: NodeJS.Timeout | null = null;
    readonly uuid: string = uuid();

    constructor(private emitter: AppEventEmitter, private interval = 30_000) {} 

    startPoll(): void {
        if (!this.intervalId) {
            this.intervalId = setInterval(() => {
                this.getStatusAndEmit();
            }, this.interval);
        }
    };

    stopPoll(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    };

    async getStatusAndEmit(): Promise<void> {
        this.emitter.updateStatus(await this.getStatus());
    };
}
