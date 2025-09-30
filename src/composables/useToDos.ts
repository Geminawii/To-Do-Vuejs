import { useQuery, useQueryClient } from "@tanstack/vue-query";
import localforage from "localforage";
import { computed } from "vue";
import { toast } from "vue-sonner";

export interface Todo {
  id: string | number;
  todo: string;
  completed: boolean;
}


async function getItem<T>(key: string, fallback: T): Promise<T> {
  const value = await localforage.getItem<T>(key);
  return value ?? fallback;
}

async function getLocalTodos(): Promise<Todo[]> {
  return getItem("localTodos", [] as Todo[]);
}

async function deleteLocalTodo(id: string | number) {
  const todos = await getLocalTodos();
  const updated = todos.filter((t) => t.id !== id);
  await localforage.setItem("localTodos", updated);
}

async function updateLocalTodo(id: string | number, changes: Partial<Todo>) {
  const todos = await getLocalTodos();
  const updated = todos.map((t) => (t.id === id ? { ...t, ...changes } : t));
  await localforage.setItem("localTodos", updated);
}


async function fetchAllTodos(): Promise<{ todos: Todo[] }> {
  const res = await fetch("https://dummyjson.com/todos?limit=100");
  if (!res.ok) throw new Error("API fetch failed.");

  const data = await res.json();
  const localTodos = await getLocalTodos();
  const deletedIds = await getItem<(string | number)[]>("deletedApiTodos", []);

  const apiTodos = data.todos.filter((todo: Todo) => !deletedIds.includes(todo.id));
  return { todos: [...localTodos, ...apiTodos] };
}


export function useTodos() {
  const queryClient = useQueryClient();

  const { data, isError, isLoading, refetch } = useQuery<{ todos: Todo[] }, Error>({
    queryKey: ["todos"],
    queryFn: fetchAllTodos,
  });

  const allTodos = computed(() => data.value?.todos || []);

  const deleteTodos = async (ids: (string | number)[]) => {
    try {
      const deletedApiTodos = new Set(
        await getItem<(string | number)[]>("deletedApiTodos", [])
      );

      let localTodos = await getLocalTodos();

      for (const id of ids) {
        if (String(id).startsWith("local-")) {
          localTodos = localTodos.filter((t) => t.id !== id);
          await deleteLocalTodo(id);
        } else {
          const res = await fetch(`https://dummyjson.com/todos/${id}`, {
            method: "DELETE",
          });
          if (!res.ok) throw new Error(`Failed to delete todo ${id}`);
          deletedApiTodos.add(id);
        }

        queryClient.setQueryData<{ todos: Todo[] } | undefined>(
          ["todos"],
          (old) => old ? { ...old, todos: old.todos.filter((t) => t.id !== id) } : old
        );
        queryClient.removeQueries({ queryKey: ["todo", id] });
      }

      await localforage.setItem("deletedApiTodos", Array.from(deletedApiTodos));
      await localforage.setItem("localTodos", localTodos);

      toast.success("Todos successfully deleted.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete todos.");
    }
  };

  const markAsCompleted = async (ids: (string | number)[]) => {
    try {
      for (const id of ids) {
        if (parseInt(String(id)) <= 150) {
          await fetch(`https://dummyjson.com/todos/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed: true }),
          });
        } else {
          await updateLocalTodo(id, { completed: true });
        }
      }

      toast.success("Marked as completed.");
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark todos.");
    }
  };

  const stats = computed(() => {
    const total = allTodos.value.length;
    const completedCount = allTodos.value.filter((t) => t.completed).length;
    const pendingCount = total - completedCount;
    return {
      total,
      completedCount,
      pendingCount,
      completedPercentage: total ? Math.round((completedCount / total) * 100) : 0,
      pendingPercentage: total ? Math.round((pendingCount / total) * 100) : 0,
    };
  });

  return {
    allTodos,
    isLoading,
    isError,
    deleteTodos,
    markAsCompleted,
    stats,
    refetch,
  };
}
