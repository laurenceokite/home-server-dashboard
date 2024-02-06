import { ref, onMounted, onUnmounted } from "vue";
import type { ApplicationMonitor, Dashboard, OfflineMonitor } from "../../../shared/types";
import type { SSEApplicationStatus, SSEInitialize, SSEMessage } from "../../../shared/sse.types";

const initDashboard: Dashboard = {
    applications: new Map<string, ApplicationMonitor | OfflineMonitor>()
}

const eventSource = ref<EventSource | null>(null);
const dashboard = ref<Dashboard>(initDashboard);

export function useDashboardStream() {
    const baseUrl = import.meta.env.DEV ? import.meta.env.VITE_BASE_URL : "";
    
    onMounted(() => {
        if (!eventSource.value) {
            eventSource.value = new EventSource(`${baseUrl}/events`);

            eventSource.value.onmessage = (e) => {
                const data = JSON.parse(e.data) as SSEMessage;

                switch (data.type) {
                    case "initialize":
                        initialize(data as SSEInitialize);
                        break;
                    case "applicationStatus":
                        updateApplicationStatus(data as SSEApplicationStatus);
                        break;
                }
            };

            eventSource.value.onerror = (e) => {
                console.error('SSE error:', e);
                eventSource.value!.close();
                eventSource.value = null;
            };

        }
    });

    return dashboard;
} 

function initialize(initData: SSEInitialize) {
    dashboard.value = initDashboard;

    if (initData.latestResults.length) {
        dashboard.value.applications = initData.latestResults;
    }
}

function updateApplicationStatus(status: SSEApplicationStatus) { 
    status.data.forEach(stat => {
        dashboard.value.applications.set(stat.uuid, stat);
    });
}
