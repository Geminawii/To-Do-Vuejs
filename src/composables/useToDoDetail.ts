
import { ref } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import localforage from 'localforage'
import type { Todo } from '@/types'

export function useTodoDetail(id: string | number) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const showContent = ref(false)
  const isEditDialogOpen = ref(false)
  const isDeleteDialogOpen = ref(false)


  async function fetchTodo(id: string | number): Promise<Todo> {
    const res = await fetch(`https://dummyjson.com/todos/${id}`)
    if (!res.ok) throw new Error('Failed to fetch todo.')
    return res.json()
  }

  function getExtendedTodo(id: string | number) {
    if (typeof window === 'undefined') return {}
    const extended = JSON.parse(localStorage.getItem('extendedTodos') || '{}')
    return extended[id] || {}
  }

  const { data, isFetching, isError } = useQuery<Todo>({
  queryKey: ['todo', id],
  queryFn: async () => {
    const cached = queryClient
      .getQueryData<{ todos: Todo[] }>(['todos'])
      ?.todos?.find((t) => String(t.id) === String(id))

    const baseTodo = cached || (await fetchTodo(id))
    const extended = getExtendedTodo(baseTodo.id)

    return {
      ...baseTodo,
      ...extended,
      date: extended.date ?? '',
      priority: extended.priority ?? 'medium',
      description: extended.description ?? 'Get this done soon!',
    } as Todo
  },
})


  const handleDelete = async () => {
    if (!data.value) return
    try {
      if (String(data.value.id).startsWith('local-')) {
        const todos: Todo[] = (await localforage.getItem('localTodos')) || []
        const updated = todos.filter((t) => t.id !== data.value.id)
        await localforage.setItem('localTodos', updated)

        toast.success('Local todo successfully removed.')
        router.push('/dashboard')
        queryClient.setQueryData(['todos'], (old: { todos: Todo[] } | undefined) =>
          old ? { ...old, todos: old.todos.filter((t) => t.id !== data.value.id) } : old,
        )
        queryClient.removeQueries({ queryKey: ['todo', data.value.id] })
      } else {
        const res = await fetch(`https://dummyjson.com/todos/${data.value.id}`, {
          method: 'DELETE',
        })
        if (!res.ok) throw new Error('Failed to delete todo.')

        toast.success('Todo successfully removed.')
        router.push('/dashboard')

        queryClient.setQueryData(['todos'], (old: { todos: Todo[] } | undefined) =>
          old ? { ...old, todos: old.todos.filter((t) => t.id !== data.value.id) } : old,
        )
        queryClient.removeQueries({ queryKey: ['todo', data.value.id] })
      }
    } catch (err) {
      toast.error('Failed to delete todo.')
      console.error(err)
    }
  }

  return {
    data,
    isFetching,
    isError,
    showContent,
    isEditDialogOpen,
    isDeleteDialogOpen,
    handleDelete,
  }
}
