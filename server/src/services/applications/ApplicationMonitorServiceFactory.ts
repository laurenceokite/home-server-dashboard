import { AppEventEmitter } from "../../events/appEmitter";
import type { ApplicationInstance, ApplicationMonitor, RadarrMonitor } from "../../../../shared/types";
import ApplicationMonitorService from "./ApplicationMonitorService";
import { ApplicationName } from "../../../../shared/types";
import RadarrService from "./RadarrService";

export default class ApplicationMonitorServiceFactory {
    static createService<T extends ApplicationMonitor>(instance: ApplicationInstance<T>, emitter: AppEventEmitter): ApplicationMonitorService<T> {
        const { app } = instance;

        switch (app) {
            case ApplicationName.Radarr:
                return new RadarrService(instance as RadarrMonitor, emitter) as ApplicationMonitorService<T>;            
            default:
                throw new Error(`Unsupported application monitor type: ${instance.app}`);
        }
    }
}
