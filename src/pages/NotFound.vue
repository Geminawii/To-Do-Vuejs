<template>
  <div
    class="h-screen flex flex-col items-center justify-center space-y-6 bg-orange-50 text-center p-6"
  >
    <h1 class="text-4xl font-bold text-orange-900">404 - Page Not Found</h1>
    <p class="text-orange-800 text-lg">The page you're looking for doesn't exist.</p>

    <Button class="mt-4 bg-gray-200 text-gray-600 hover:bg-gray-300" @click="goToDashboard">
      Go to Dashboard
    </Button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from '@/components/ui/button/Button.vue'

const router = useRouter()

const goToDashboard = () => {
  router.push('/dashboard')
}
</script>
