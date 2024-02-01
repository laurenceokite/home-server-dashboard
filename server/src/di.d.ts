import { ApplicationMonitorService, ApplicationName } from "./types"

interface ServiceRegistry {
    [K in ApplicationName]: ApplicationMonitorService;
}

