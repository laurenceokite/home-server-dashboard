<template>
    <monitor-content-wrapper>
        <div v-if="rootFolders.length" v-for="folder in rootFolders" class="flex px-2 py-1 items-center justify-between">
            <div class="flex items-center">
                <iconify icon="mdi:folder-home-outline" :style="{ fontSize: '24px' }" />
                <p class="pl-2">{{ folder.path }}</p>
            </div> 
            <div v-if="folder.freeBytes">
                {{ `${formatBytes(folder.freeBytes)} available` }}
                <span v-if="folder.totalBytes">{{ `out of ${formatBytes(folder.totalBytes)}` }}</span>
            </div>
        </div>
        <div>
            
        </div>
    </monitor-content-wrapper>
</template>

<script setup lang="ts">
import MonitorContentWrapper from "./MonitorContentWrapper.vue";
import type { DownloadClientMonitor } from "../types";
import { formatBytes } from "../utilities";
import { Icon as iconify } from "@iconify/vue";

const props = defineProps<DownloadClientMonitor>();

</script>
