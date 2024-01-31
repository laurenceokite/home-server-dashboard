<template>
    <div v-if="monitor.up">
        <download-client :root-folders="monitor.rootFolders" :queued="monitor.queued"></download-client>
    </div>
</template>

<script setup lang="ts">
import DownloadClient from '../DownloadClient.vue';
import type { RadarrMonitor } from "../../types";

const props = defineProps<{
    monitor: RadarrMonitor;
}>();
</script>
