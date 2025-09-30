<script setup lang="ts">
import { ref, onMounted } from "vue";

const greeting = ref("");

onMounted(() => {
  const hour = new Date().getHours();

  if (hour < 12) {
    greeting.value = "Good morning! What’s on your list today?";
  } else if (hour < 18) {
    greeting.value = "Good afternoon! Ready to tackle your tasks?";
  } else {
    greeting.value = "Good evening! Let’s wrap up today’s plans.";
  }
});
</script>

<template>
  <p class="text-xl sm:text-2xl font-bold text-orange-900 mb-4 justify-center text-center">
    {{ greeting || "What plans do you have for today?" }}
  </p>
</template>
