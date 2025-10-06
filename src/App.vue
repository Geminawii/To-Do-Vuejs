<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
import 'vue-sonner/style.css'
import ErrorBoundary from './components/misc/ErrorBoundary.vue';
</script>

<template>
  <Toaster />
  <ErrorBoundary>
    <router-view />
  </ErrorBoundary>
</template>
