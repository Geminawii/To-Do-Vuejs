// composables/useCategories.ts
import { ref, computed } from 'vue'
import { toast } from 'sonner'
import type { LocalCategory, Todo } from '@/types'
import {
  getCategoriesFromLocal,
  saveCategoriesToLocal,
  deleteCategory,
  updateCategory,
  getTodosByCategory,
} from '@/utils/localsstorage'
import { useQueryClient } from '@tanstack/vue-query'

export function useCategories() {
  const categories = ref<LocalCategory[]>([])
  const todosByCategory = ref<Record<number, Todo[]>>({})
  const newCategory = ref('')
  const editingId = ref<number | null>(null)
  const editValue = ref('')
  const selectedCategoryId = ref<number | null>(null)
  const search = ref('')

  const queryClient = useQueryClient()
  const allTodos: Todo[] = queryClient.getQueryData<{ todos: Todo[] }>(['todos'])?.todos || []

  const loadCategories = async () => {
    const saved = await getCategoriesFromLocal()
    categories.value = saved
    await refetchTodos(saved)
  }

  const refetchTodos = async (source: LocalCategory[] = categories.value) => {
    const map: Record<number, Todo[]> = {}

    for (const cat of source) {
      const catId = Number(cat.id)

      const ids: number[] = await getTodosByCategory(catId)

      map[catId] = allTodos.filter((todo) => ids.includes(Number(todo.id))) || []
    }

    todosByCategory.value = map
  }

  const addCategory = async () => {
    if (!newCategory.value.trim()) return toast.error('Name is required')
    const exists = categories.value.some(
      (c) => c.name.toLowerCase() === newCategory.value.trim().toLowerCase(),
    )
    if (exists) return toast.error('Category already exists')

    const newEntry: LocalCategory = {
      id: Date.now(),
      name: newCategory.value.trim(),
    }
    const updated = [...categories.value, newEntry]
    await saveCategoriesToLocal(updated)
    categories.value = updated
    newCategory.value = ''
    toast.success('Category added!')
  }

  const deleteCat = async (id: number) => {
    await deleteCategory(id)
    categories.value = categories.value.filter((c) => c.id !== id)
    toast.success('Deleted category')
    await refetchTodos(categories.value)
  }

  const startEditing = (id: number, name: string) => {
    editingId.value = id
    editValue.value = name
  }

  const editCategory = async () => {
    if (!editValue.value.trim()) return toast.error('Name cannot be empty')
    if (editingId.value === null) return

    await updateCategory(editingId.value, editValue.value.trim())
    categories.value = categories.value.map((c) =>
      c.id === editingId.value ? { ...c, name: editValue.value.trim() } : c,
    )
    editingId.value = null
    editValue.value = ''
    toast.success('Category updated!')
  }

  const filteredTodos = computed<Todo[]>(() =>
    allTodos.filter((todo) => todo.todo.toLowerCase().includes(search.value.toLowerCase())),
  )

  return {
    categories,
    todosByCategory,
    newCategory,
    editingId,
    editValue,
    selectedCategoryId,
    search,
    allTodos,
    filteredTodos,
    loadCategories,
    refetchTodos,
    addCategory,
    deleteCat,
    startEditing,
    editCategory,
  }
}
