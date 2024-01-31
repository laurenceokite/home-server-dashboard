<template>
  <header>
  </header>  
  <main>
      <div v-for="monitor in appMonitors">
        <app-monitor :monitor="monitor"></app-monitor>
      </div>
  </main>
</template>

<script setup lang="ts">
import AppMonitor from "./components/AppMonitor.vue";
import { onMounted, onUnmounted, ref } from 'vue';
import { useAppMonitorStore } from "./stores/appMonitor";

const interval = ref<ReturnType<typeof setInterval>>();
const REFFRESH_RATE = 30_000;

const { getStatusAll, appMonitors } = useAppMonitorStore();

onMounted(() => {
    getStatusAll();
    interval.value = setInterval(getStatusAll, REFFRESH_RATE);
});

onUnmounted(() => {
    if (interval.value) {
        clearInterval(interval.value);
    } 
});
</script>

