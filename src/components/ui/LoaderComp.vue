<template>
  <div
    class="flex items-center justify-center"
    role="status"
    aria-label="Loading spinner"
  >
    <svg
      class="animate-spin"
      :class="[size, color]"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8z"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: string
  color?: string
}

withDefaults(defineProps<Props>(), {
  size: 'w-8 h-8', // Default to 32px
  color: 'text-orange-500', // Tailwind orange
})
</script>
