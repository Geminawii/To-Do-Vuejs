<script setup lang="ts">
import { ref, onErrorCaptured } from "vue";
import { useRouter } from "vue-router";
import Button from "../ui/button/Button.vue";

const hasError = ref(false);
const router = useRouter();

function handleReset() {
  hasError.value = false;
  router.push("/dashboard");
}

onErrorCaptured((err, instance, info) => {
  console.error("Layout-level uncaught error:", err, info);
  hasError.value = true;
  return false;
});
</script>

<template>
  <div v-if="hasError" class="h-screen flex flex-col items-center justify-center text-center space-y-4 bg-orange-50">
    <h1 class="text-2xl font-bold text-orange-900">Something went wrong.</h1>
    <p class="text-orange-800">An unexpected error occurred.</p>
    <Button @click="handleReset" class="bg-gray-300 text-gray-900 hover:bg-gray-400">
      Go Home
    </Button>
  </div>

  <div v-else>
    <slot />
  </div>
</template>
