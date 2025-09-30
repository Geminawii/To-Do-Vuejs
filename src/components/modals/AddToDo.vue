<script setup lang="ts">
import { ref } from "vue";
import { toast } from "sonner";
import localforage from "localforage";
import { useQueryClient } from "@tanstack/vue-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoaderComp from "@/components/ui/LoaderComp.vue";
import TextArea from "../ui/textarea/TextArea.vue";


interface Todo {
  id: string;
  todo: string;
  completed: boolean;
  userId: number;
  date: string;
  priority: "low" | "medium" | "high" | "";
  description: string;
}

const props = defineProps<{ closeModal?: () => void }>();

const title = ref("");
const date = ref("");
const priority = ref<Todo["priority"]>("");
const description = ref("");
const loading = ref(false);
const userId = ref(1);

const queryClient = useQueryClient();

const handleSubmit = async () => {
  if (!title.value.trim()) return toast.error("Title is required");
  loading.value = true;
  try {
    const newId = `local-${Date.now()}`;
    const newTodo: Todo = {
      id: newId,
      todo: title.value,
      completed: false,
      userId: userId.value,
      date: date.value,
      priority: priority.value,
      description: description.value,
    };

    const todos = (await localforage.getItem<Todo[]>("localTodos")) || [];
    todos.push(newTodo);
    await localforage.setItem("localTodos", todos);

    toast.success("Local todo successfully added.");
    queryClient.invalidateQueries({ queryKey: ["todos"] });

    props.closeModal?.();
  } catch (err) {
    toast.error("Failed to create.");
    console.error(err);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <Card class="w-full max-w-md mx-auto rounded-md">
    <CardContent class="p-6 relative">
      <button
        v-if="props.closeModal"
        @click="props.closeModal()"
        aria-label="Close"
        class="absolute top-4 right-4 text-orange-700 hover:text-orange-900"
      />

      <h1 class="text-xl font-semibold text-orange-800 mb-4">Add New Todo</h1>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block mb-1 text-sm font-medium">Title</label>
          <Input v-model="title" required />
        </div>

        <div>
          <label class="block mb-1 text-sm font-medium">Due Date</label>
          <Input type="date" v-model="date" />
        </div>

        <div>
          <label class="block mb-1 text-sm font-medium">Priority</label>
          <div class="flex gap-3">
            <label
              v-for="level in ['low','medium','high']"
              :key="level"
              class="flex items-center gap-2 px-3 py-1 rounded-md border cursor-pointer"
              :class="priority === level ? 'border-orange-600 bg-orange-100' : 'border-gray-300'"
            >
              <input
                type="radio"
                name="priority"
                class="hidden"
                :value="level"
                v-model="priority"
              />
              {{ level.charAt(0).toUpperCase() + level.slice(1) }}
            </label>
          </div>
        </div>

        <div>
          <label class="block mb-1 text-sm font-medium">Description</label>
          <TextArea rows="3" v-model="description" placeholder="Details about the task..." />
        </div>

        <Button type="submit" class="w-full" :disabled="loading">
          <template v-if="loading">
            <LoaderComp size="20" />
          </template>
          <template v-else>
            Create Todo
          </template>
        </Button>
      </form>
    </CardContent>
  </Card>
</template>
