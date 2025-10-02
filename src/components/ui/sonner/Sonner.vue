<script lang="ts" setup>
import { Toaster as Sonner } from "vue-sonner"
type SonnerProps = InstanceType<typeof Sonner>['$props']

const props = defineProps<SonnerProps>()
</script>

<template>
  <Sonner
    class="toaster group"
    v-bind="props"
    :style="{
      '--normal-bg': 'var(--popover)',
      '--normal-text': 'var(--popover-foreground)',
      '--normal-border': 'var(--border)',
    }"
  />
</template>
