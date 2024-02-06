<template>
  <header>
  </header>  
  <main>
      <div v-for="app in dashboard.applications.values()">
        <app-monitor :monitor="app"></app-monitor>
      </div>
  </main>
</template>

<script setup lang="ts">
import AppMonitor from "./components/AppMonitor.vue";
import { useDashboardStream } from "./composables/dashboard";

const dashboard = useDashboardStream();
</script>

