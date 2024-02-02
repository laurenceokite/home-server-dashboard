import { EventEmitter } from "stream";
import { ApplicationMonitor, OfflineMonitor } from "../types";

export class AppEventEmitter extends EventEmitter {
    onStatusUpdate(callback: (monitor: ApplicationMonitor | OfflineMonitor) => void): void {
        this.on("update", callback);
    };

    updateStatus(status: ApplicationMonitor | OfflineMonitor) {
        this.emit("update", status);
    }
}

export default new AppEventEmitter();
