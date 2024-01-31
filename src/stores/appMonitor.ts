import { RadarrService } from "@/services/RadarrService";
import type { ApplicationMonitorService, ApplicationMonitor, OfflineMonitor } from "@/types";
import { ApplicationName } from "@/types";
import { ref } from "vue";
import { defineStore } from "pinia";

export const useAppMonitorStore = defineStore('appMonitor', () => {
    
    const serviceRegistry: { 
        [key: string]: ApplicationMonitorService<ApplicationMonitor>;
    } = { 
        [ApplicationName.Radarr]: new RadarrService(),
    };

    function getStatusAll() { 
       getStatus(ApplicationName.Radarr); 
    }

    const serviceError = (name: ApplicationName): OfflineMonitor => ({
        name,
        url: "",
        up: false,
        errors: ["Service not registered for this application"]
    }) 

    async function getStatus(appName: ApplicationName) {
        appMonitors.value[appName] = await serviceRegistry[appName]?.getStatus() ?? serviceError(appName);
    } 

    const appMonitors = ref<{ [key: string]: ApplicationMonitor | OfflineMonitor }>({});

    return { serviceRegistry, getStatus, getStatusAll, appMonitors }
});
