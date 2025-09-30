<script setup lang="ts">
import { computed } from "vue";

interface TaskData {
  id: string | number;
  todo: string;
  completed: boolean;
  priority?: "high" | "medium" | "low";
}

const props = defineProps<{
  task: TaskData;
  index: number;
  isLocal: boolean;
}>();

const isComplete = computed(() => props.task.completed);

const uniqueId = computed(() =>
  typeof props.task.id === "number" && props.task.id <= 150
    ? `api-${props.task.id}`
    : `local-${props.task.id}`
);

const priorityClass = computed(() => {
  switch (props.task.priority) {
    case "high":
      return "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200";
    case "medium":
      return "bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200";
    case "low":
      return "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200";
    default:
      return "";
  }
});
</script>

<template>
  <div
    :key="uniqueId"
    class="flex items-center p-3 mb-2 rounded-md shadow-sm w-full bg-gray-100 dark:bg-gray-800"
  >
    <span
      class="font-semibold text-orange-800 dark:text-orange-200
        text-xs sm:text-sm flex-grow
        max-w-32 sm:max-w-none
        overflow-hidden whitespace-nowrap text-ellipsis
        sm:whitespace-normal sm:overflow-visible sm:text-clip"
      :class="{
        'line-through text-gray-400 dark:text-gray-500': isComplete,
      }"
    >
      {{ task.todo }}
      <span
        v-if="isLocal"
        class="ml-2 text-[10px] text-gray-500 dark:text-gray-400"
      >
        (Local)
      </span>
    </span>

    <div
      class="flex items-center gap-2 sm:gap-3 text-xs font-semibold whitespace-nowrap flex-shrink-0"
    >
      <span
        v-if="task.priority"
        class="px-2 py-0.5 rounded-full text-[10px]"
        :class="priorityClass"
      >
        {{ task.priority.charAt(0).toUpperCase() + task.priority.slice(1) }}
      </span>
    </div>
  </div>
</template>
