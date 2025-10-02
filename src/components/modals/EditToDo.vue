<script setup lang="ts">
import { ref } from "vue";
import { toast } from "vue-sonner";
import localforage from "localforage";
import { useQueryClient } from "@tanstack/vue-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoaderComp from "@/components/ui/LoaderComp.vue";
import TextArea from "../ui/textarea/TextArea.vue";

interface Todo {
  id: string | number;
  todo: string;
  completed: boolean;
  userId: number;
  date: string;
  priority: "low" | "medium" | "high";
  description: string;
}

const props = defineProps<{
  todo: Todo;
  closeModal: () => void;
}>();

const title = ref(props.todo.todo || "");
const date = ref(props.todo.date || "");
const priority = ref<Todo["priority"]>(props.todo.priority || "medium");
const description = ref(props.todo.description || "");
const loading = ref(false);

const queryClient = useQueryClient();

const handleUpdate = async () => {
  if (!title.value.trim()) return toast.error("Title is required");
  loading.value = true;

  try {
    let updatedTodo: Todo | null = null;

    if (String(props.todo.id).startsWith("local-")) {
      const todos: Todo[] = (await localforage.getItem("localTodos")) || [];
      const idx = todos.findIndex((t) => t.id === props.todo.id);

      if (idx !== -1) {
        todos[idx] = {
          ...todos[idx],
          todo: title.value,
          date: date.value,
          priority: priority.value,
          description: description.value,
        };
        await localforage.setItem("localTodos", todos);
        updatedTodo = todos[idx];
        toast.success("Local todo updated!");
      }
    } else {
      const res = await fetch(`https://dummyjson.com/todos/${props.todo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          todo: title.value,
          date: date.value,
          priority: priority.value,
          description: description.value,
        }),
      });
      if (!res.ok) throw new Error("Failed to update todo.");
      updatedTodo = await res.json();
      toast.success("Todo updated!");
    }

    if (updatedTodo) {
      // Update single todo cache
      queryClient.setQueryData<Todo>(["todo", props.todo.id], updatedTodo);

      queryClient.setQueryData<{ todos: Todo[] }>(["todos"], (old) => {
        if (!old?.todos) return old;
        return {
          ...old,
          todos: old.todos.map((t) =>
            t.id === props.todo.id ? updatedTodo! : t
          ),
        };
      });

      props.closeModal();
    }
  } catch (err) {
    toast.error("Failed to update todo.");
    console.error(err);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <Card class="w-full max-w-md mx-auto rounded-md">
    <CardContent class="p-6 relative">
      <h1 class="text-xl font-semibold text-orange-800 mb-4">Edit Todo</h1>

      <form @submit.prevent="handleUpdate" class="space-y-4">
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Title</label>
          <Input v-model="title" type="text" required />
        </div>

        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Due Date</label>
          <Input v-model="date" type="date" />
        </div>

        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Priority</label>
          <div class="flex gap-3">
            <label
              v-for="level in ['low','medium','high']"
              :key="level"
              class="flex items-center gap-2 px-3 py-1 rounded-md border cursor-pointer"
              :class="priority === level ? 'border-orange-600 bg-orange-100 text-orange-800' : 'border-gray-300'"
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
          <label class="block mb-1 text-sm font-medium text-gray-700">Description</label>
          <TextArea v-model="description" rows="3" placeholder="Details about the task..." />
        </div>

        <Button type="submit" class="w-full" :disabled="loading">
          <template v-if="loading">
            <LoaderComp size="20" />
          </template>
          <template v-else>
            Update Todo
          </template>
        </Button>
      </form>
    </CardContent>
  </Card>
</template>
