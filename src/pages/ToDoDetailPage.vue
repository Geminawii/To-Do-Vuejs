<script setup lang="ts">
import { watchEffect, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Navbar from '@/components/layout/NavbarView.vue'
import EditTodoModal from '@/components/modals/EditToDo.vue'
import LoaderComp from '@/components/ui/LoaderComp.vue'
import { Dialog, TransitionRoot, TransitionChild, DialogPanel } from '@headlessui/vue'
import { useTodoDetail } from '@/composables/useToDoDetail'

const route = useRoute()
const router = useRouter()
const id = route.params.id as string

const {
  data,
  isFetching,
  isError,
  showContent,
  isEditDialogOpen,
  isDeleteDialogOpen,
  handleDelete,
} = useTodoDetail(id)

const todo = computed(() => data.value)

onMounted(() => {
  watchEffect(() => {
    if (!isFetching.value) {
      setTimeout(() => (showContent.value = true), 500)
    }
  })
})
</script>

<template>
  <div class="min-h-screen bg-orange-50">
    <Navbar />

    <div class="flex mt-2 sm:mt-5">
      <main class="flex-1 p-4 sm:p-6">
        <div
          v-if="isFetching || !showContent"
          class="flex flex-col items-center justify-center h-screen space-y-4 bg-orange-50 p-4"
        >
          <LoaderComp size="48" color="text-orange-500" />
          <span class="text-lg font-semibold text-orange-800">Loading task...</span>
        </div>

        <div
          v-else-if="isError"
          class="min-h-screen flex items-center justify-center text-amber-800 p-4 font-extrabold"
        >
          Failed to load.
        </div>

        <div
          v-else-if="!todo"
          class="min-h-screen flex items-center justify-center text-amber-800 p-4 font-extrabold"
        >
          Todo not found.
        </div>

        <Card v-else class="max-w-4xl w-full mx-auto shadow-md">
          <CardContent class="p-4 sm:p-6 flex flex-col gap-4">
            <div class="w-full flex justify-start">
              <Button
                variant="link"
                @click="router.push('/dashboard')"
                class="text-orange-800 p-0 text-sm sm:text-base text-left"
              >
                Back to Dashboard
              </Button>
            </div>

            <div class="flex items-center justify-between">
              <h1 class="text-xl sm:text-2xl font-semibold text-orange-900">{{ todo.todo }}</h1>

              <div class="flex gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Edit"
                  @click="isEditDialogOpen = true"
                >
                  <Icon icon="mdi:pencil" class="w-5 h-5 text-orange-800" />
                </Button>

                <TransitionRoot appear :show="isEditDialogOpen">
                  <Dialog
                    :open="isEditDialogOpen"
                    @close="isEditDialogOpen = false"
                    class="relative z-50"
                  >
                    <TransitionChild
                      enter="ease-out duration-200"
                      enter-from="opacity-0"
                      enter-to="opacity-100"
                      leave="ease-in duration-150"
                      leave-from="opacity-100"
                      leave-to="opacity-0"
                    >
                      <div class="fixed inset-0 bg-black/30" />
                    </TransitionChild>

                    <div class="fixed inset-0 flex items-center justify-center p-4">
                      <DialogPanel class="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
                        <EditTodoModal
                          :todo="{
                            ...todo,
                            userId: todo.userId ?? 0,
                            date: todo.date ?? '',
                            priority: todo.priority ?? 'medium',
                            description: todo.description ?? '',
                          }"
                          :closeModal="() => (isEditDialogOpen = false)"
                        />
                      </DialogPanel>
                    </div>
                  </Dialog>
                </TransitionRoot>

                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Delete"
                  @click="isDeleteDialogOpen = true"
                >
                  <Icon icon="mdi:trash-can-outline" class="w-5 h-5 text-orange-800" />
                </Button>

                <TransitionRoot appear :show="isDeleteDialogOpen">
                  <Dialog
                    :open="isDeleteDialogOpen"
                    @close="isDeleteDialogOpen = false"
                    class="relative z-50"
                  >
                    <TransitionChild
                      enter="ease-out duration-200"
                      enter-from="opacity-0"
                      enter-to="opacity-100"
                      leave="ease-in duration-150"
                      leave-from="opacity-100"
                      leave-to="opacity-0"
                    >
                      <div class="fixed inset-0 bg-black/30" />
                    </TransitionChild>

                    <div class="fixed inset-0 flex items-center justify-center p-4">
                      <DialogPanel class="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
                        <h2 class="text-lg sm:text-xl font-semibold text-orange-900">
                          Delete Todo?
                        </h2>
                        <p class="text-orange-800 text-sm sm:text-base mt-2">
                          Are you sure you want to permanently delete this task?
                        </p>
                        <div class="flex justify-end gap-2 pt-4">
                          <Button variant="outline" @click="isDeleteDialogOpen = false">
                            Cancel
                          </Button>
                          <Button variant="destructive" @click="handleDelete">Delete</Button>
                        </div>
                      </DialogPanel>
                    </div>
                  </Dialog>
                </TransitionRoot>
              </div>
            </div>

            <ul
              class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base text-gray-700 mt-4"
            >
              <li class="flex items-center gap-2">
                <Icon icon="mdi:identifier" class="text-orange-600 w-4 h-4 sm:w-5 sm:h-5" />
                <span><strong>ID:</strong> {{ todo.id }}</span>
              </li>
              <li class="flex items-center gap-2">
                <Icon icon="mdi:account" class="text-orange-600 w-4 h-4 sm:w-5 sm:h-5" />
                <span><strong>User ID:</strong> {{ todo.userId }}</span>
              </li>
              <li class="flex items-center gap-2">
                <Icon
                  :icon="todo.completed ? 'mdi:check-circle' : 'mdi:close-circle'"
                  :class="[
                    'w-4 h-4 sm:w-5 sm:h-5',
                    todo.completed ? 'text-green-600' : 'text-red-600',
                  ]"
                />
                <span
                  ><strong>Status:</strong>
                  {{ todo.completed ? 'Completed' : 'Not completed' }}</span
                >
              </li>
              <li v-if="todo.priority" class="flex items-center gap-2">
                <Icon icon="mdi:flag" class="text-orange-600 w-4 h-4 sm:w-5 sm:h-5" />
                <span><strong>Priority:</strong> {{ todo.priority }}</span>
              </li>
              <li v-if="todo.date" class="flex items-center gap-2">
                <Icon icon="mdi:calendar" class="text-orange-600 w-4 h-4 sm:w-5 sm:h-5" />
                <span><strong>Due Date:</strong> {{ todo.date }}</span>
              </li>
              <li v-if="todo.description" class="sm:col-span-2 bg-orange-50 p-3 rounded-md border">
                <strong>Description:</strong>
                <p class="mt-1 text-gray-600">{{ todo.description }}</p>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  </div>
</template>
