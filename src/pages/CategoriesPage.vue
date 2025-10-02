<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import Navbar from '@/components/layout/NavbarView.vue'
import Sidebar from '@/components/layout/SidebarResponsive.vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogTitle, DialogContent } from '@/components/ui/dialog'
import { useCategories } from '@/composables/useCategories'
import { assignTodoToCategory } from '@/utils/localsstorage'
import { Icon } from '@iconify/vue'
import JustAskEet from '@/components/misc/JustAskEet.vue'

const {
  categories,
  todosByCategory,
  newCategory,
  editingId,
  editValue,
  selectedCategoryId,
  search,
  filteredTodos,
  loadCategories,
  addCategory,
  deleteCat,
  startEditing,
  editCategory,
} = useCategories()

const dialogOpen = ref(false)

onMounted(() => {
  loadCategories()
})

const openTodoDialog = (catId: number) => {
  selectedCategoryId.value = catId
  dialogOpen.value = true
}

const handleAssignTodo = async (todoId: number) => {
  if (!selectedCategoryId.value) return
  await assignTodoToCategory(todoId, selectedCategoryId.value)
  toast.success('Todo added to category.')
  dialogOpen.value = false
  await loadCategories()
}
</script>

<template>
  <div class="min-h-screen bg-orange-50 overflow-x-hidden">
    <Navbar />

    <div class="flex flex-col lg:flex-row mt-5">
      <div class="hidden lg:block">
        <Sidebar />
      </div>

      <main class="flex-1 px-4 py-6 sm:px-6 lg:px-8 -mt-5">
        <div class="bg-white rounded-md shadow-md p-4 sm:p-6 min-h-[calc(100vh-5rem)]">
          <h1 class="text-2xl sm:text-3xl font-bold mb-6 text-orange-800">Create A Category</h1>

          <div class="flex flex-col sm:flex-row gap-3 mb-6 max-w-full sm:max-w-md">
            <Input
              v-model="newCategory"
              type="text"
              placeholder="New category name"
              class="w-full"
            />
            <Button @click="addCategory" class="bg-amber-800">Add</Button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="cat in categories"
              :key="cat.id"
              class="bg-gray-100 p-4 rounded-md flex flex-col gap-2"
            >
              <div class="flex justify-between items-center">
                <div v-if="editingId === cat.id" class="flex items-center gap-2 w-full">
                  <Input v-model="editValue" class="flex-1" />
                  <Button @click="editCategory" size="sm" class="bg-amber-800">Save</Button>
                  <Button
                    @click="
                      () => {
                        editingId = null
                        editValue = ''
                      }
                    "
                    size="sm"
                    variant="ghost"
                  >
                    Cancel
                  </Button>
                </div>

                <template v-else>
                  <span class="text-lg font-medium text-orange-800 ">{{ cat.name }}</span>
                  <div class="flex items-center gap-2 ">

                    <Button
                      size="icon"
                      variant="ghost"
                      @click="startEditing(cat.id, cat.name)"
                      class="text-orange-800 hover:cursor-pointer"
                      aria-label="Edit category"
                    >
                      <Icon icon="mdi:pencil" class="w-5 h-5" />
                    </Button>


                    <Button
                      size="icon"
                      variant="ghost"
                      @click="deleteCat(cat.id)"
                      class="text-orange-800 hover:cursor-pointer"
                      aria-label="Delete category"
                    >
                      <Icon icon="mdi:trash-can-outline" class="w-5 h-5" />
                    </Button>


                    <Button
                      size="icon"
                      variant="ghost"
                      @click="openTodoDialog(cat.id)"
                      class="text-orange-800 hover:cursor-pointer"
                      aria-label="Add todo"
                    >
                      <Icon icon="mdi:plus" class="w-5 h-5" />
                    </Button>
                  </div>
                </template>
              </div>

              <div v-if="todosByCategory[cat.id]?.length > 0" class="mt-2 space-y-1">
                <div
                  v-for="todo in todosByCategory[cat.id]"
                  :key="todo.id"
                  class="bg-white p-2 rounded text-sm text-orange-900 flex justify-between items-center"
                >
                  <span>{{ todo.todo }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>


    <Dialog v-model:open="dialogOpen">
      <DialogContent class="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        <DialogTitle class="text-lg font-semibold text-orange-800 mb-4">Select a Todo</DialogTitle>

        <Input v-model="search" placeholder="Search todos..." class="mb-3" />

        <div class="max-h-60 overflow-y-auto space-y-2">
          <div
            v-for="todo in filteredTodos"
            :key="todo.id"
            class="p-2 rounded-md bg-orange-100 cursor-pointer hover:bg-orange-200 text-sm"
           @click="handleAssignTodo(Number(todo.id))"
          >
            {{ todo.todo }}
          </div>
        </div>
      </DialogContent>
    </Dialog>
    <JustAskEet />
  </div>
</template>
