<template>
    <div class="grid grid-cols-1 border-2 border-neutral-400 rounded-md divide-y divide-neutral-400 min-w-[300px]">

        <a :href="monitor.url" class="grid grid-cols-12 divide-x-2 divide-neutral-400 p-0">
            <div class="col-span-4 flex items-center py-2 bg-neutral-800 rounded-l-md">
                <div class="flex items-center px-2">
                    <iconify :icon="`mdi:${monitor.icon ?? 'toy-brick'}`" :style="{ fontSize: '28px' }" />
                </div>
                <h2 class="pl-2 pr-6 font-semibold text-lg">
                    {{ ApplicationName[monitor.app] ?? "unknown" }}
                </h2>
            </div>
            <div class="col-span-8 grid grid-cols-subgrid items-center py-2">
                <div 
                    class="col-start-11 col-end-12 w-4 h-4 rounded-full relative"
                    :class="monitor.up ? 'bg-emerald-700' : 'bg-neutral-600'"
                    aria-hidden="true"
                >
                    <div
                        v-if="monitor.up"
                        class="w-4 h-4 rounded-full bg-emerald-700 absolute inset-0 animate-ping"
                        aria-hidden="true"
                    >
                    </div> 
                </div> 
            </div>
        </a>

        <component v-if="monitor.up" :is="component" :monitor="monitor"></component>
        
        <div class="bg-neutral-800 flex px-2 py-1 items-center justify-between rounded-b-md">
            <iconify icon="mdi:heart-pulse" :style="{ fontSize: '24px' }" />
            <div class="flex items-center px-1">
                <div class="flex items-center">
                    <iconify 
                        icon="mdi:bell-alert-outline" 
                        :style="{ fontSize: '20px' }" 
                        class="text-yellow-300/50 ml-3 mr-2"
                        :class="{ 'text-yellow-400/75': monitor.warnings?.length }"
                    />
                    <p class="font-semibold">{{ monitor.warnings?.length ?? 0 }}</p>
                </div> 
                <div class="flex items-center px-1">
                    <iconify 
                        icon="mdi:alert-outline" 
                        :style="{ fontSize: '20px' }" 
                        class="text-red-400/50 ml-3 mr-2"
                        :class="{ 'text-red-500/100': monitor.errors?.length }"
                    />
                    <p class="font-semibold">{{ monitor.errors?.length ?? 0 }}</p>
                </div> 
            </div>
        </div>

    </div>    
</template>

<script setup lang="ts">
import Radarr from "./app-monitors/Radarr.vue";
import { type ApplicationMonitor, ApplicationName, type OfflineMonitor } from "../types";
import { Icon as iconify } from "@iconify/vue";
import { type Component, computed } from "vue";

const props = defineProps<{
    monitor:  ApplicationMonitor | OfflineMonitor;
}>(); 

const componentMap: { [K in ApplicationName]: Component } = {
    [ApplicationName.Radarr]: Radarr
};

const component = computed<Component | null>(() => props.monitor.up ? componentMap[props.monitor.app] : null);

</script>
