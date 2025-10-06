<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTodos } from '@/composables/useToDos'
import TimeGreeting from './TimeGreeting.vue'
import TaskItem from './TaskItem.vue'
import Draggable from 'vuedraggable'
import { Icon } from '@iconify/vue'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import ChatBot from './JustAskEet.vue'
import AddToDo from '../modals/AddToDo.vue'
import MotionWrapper from '../ui/MotionWrapper.vue'

interface Props {
  user?: string
  searchTerm: string
  filter: 'completed' | 'incomplete' | 'all'
}

interface Todo {
  id: number
  title: string
  completed: boolean
}

const isOverTrash = ref(false)
const draggedTask = ref<Todo | null>(null)

const onDragStart = (task: Todo) => {
  draggedTask.value = task
}

const onDragOverTrash = () => {
  isOverTrash.value = true
}

const onDragLeaveTrash = () => {
  isOverTrash.value = false
}

const onDropOnTrash = async () => {
  if (draggedTask.value) {
    await handleDelete([draggedTask.value.id])
    draggedTask.value = null
  }
  isOverTrash.value = false
}

const props = defineProps<Props>()

const { allTodos, isError, deleteTodos, markAsCompleted, stats } = useTodos()
const isAddOpen = ref(false)

const page = ref(1)
const selectedTodos = ref<(string | number)[]>([])

const sortedTodos = computed(() =>
  [...allTodos.value].sort((a, b) => (parseInt(String(a.id)) || 0) - (parseInt(String(b.id)) || 0)),
)

const filteredTodos = computed(() => {
  return sortedTodos.value
    .filter((task) => task.todo.toLowerCase().includes(props.searchTerm.toLowerCase()))
    .filter((task) => {
      if (props.filter === 'completed') return task.completed
      if (props.filter === 'incomplete') return !task.completed
      return true
    })
})

const pageSize = 10
const totalPages = computed(() => Math.ceil(filteredTodos.value.length / pageSize))

const paginationRange = computed(() => {
  const total = totalPages.value
  const current = page.value
  const delta = 2
  const range: (number | string)[] = []

  range.push(1)

  if (current - delta > 2) {
    range.push('...')
  }

  for (let i = current - delta; i <= current + delta; i++) {
    if (i > 1 && i < total) {
      range.push(i)
    }
  }

  if (current + delta < total - 1) {
    range.push('...')
  }

  if (total > 1) {
    range.push(total)
  }

  return range
})

const paginatedTodos = computed(() => {
  const start = (page.value - 1) * pageSize
  const end = start + pageSize
  return filteredTodos.value.slice(start, end)
})

const handleToggleSelect = (id: string | number) => {
  if (selectedTodos.value.includes(id)) {
    selectedTodos.value = selectedTodos.value.filter((todoId) => todoId !== id)
  } else {
    selectedTodos.value.push(id)
  }
}

const handleDelete = async (ids: (string | number)[]) => {
  await deleteTodos(ids)
  selectedTodos.value = []
}

const handleMarkAsCompleted = async () => {
  await markAsCompleted(selectedTodos.value)
  selectedTodos.value = []
}

interface DragRemoveEvent<T> {
  removed?: {
    element: T
    oldIndex: number
  }
}

const onTaskDrop = async (event: DragRemoveEvent<{ id: string | number }>) => {
  const { removed } = event
  if (removed?.element) {
    await deleteTodos([removed.element.id])
  }
}
</script>

<template>
  <p v-if="isError" aria-live="assertive" class="p-6 text-orange-800">Error loading todos.</p>
  <p
    v-else-if="allTodos.length === 0"
    class="p-6 text-orange-800 flex items-center justify-center text-lg font-extrabold"
  >
    No tasks available just yet!
  </p>
  <MotionWrapper>
    <Card class="bg-white rounded-md shadow-md relative w-full">
      <CardHeader>
        <TimeGreeting />
      </CardHeader>
      <CardContent class="flex flex-col gap-6">
        <Card class="p-3 w-full">
          <CardHeader class="flex flex-col items-center gap-3">
            <h2 class="text-lg font-semibold text-center">To-Do List</h2>
            <div class="flex gap-3 items-center justify-center">
              <Dialog v-model:open="isAddOpen">
                <DialogTrigger as-child>
                  <Button variant="ghost" size="icon" aria-label="Add Todo">
                    <Icon icon="mdi:plus" class="w-6 h-6 text-orange-700" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <AddToDo :closeModal="() => (isAddOpen = false)" />
                </DialogContent>
              </Dialog>

              <Button
                @click="handleMarkAsCompleted"
                variant="ghost"
                size="icon"
                aria-label="Mark as Completed"
                class="text-amber-700"
              >
                <Icon icon="mdi:check-bold" class="w-6 h-6" />
              </Button>

              <div
                @dragover.prevent="onDragOverTrash"
                @dragleave="onDragLeaveTrash"
                @drop="onDropOnTrash"
                :class="[
                  'rounded-full p-2 transition-all duration-200 ease-in-out cursor-pointer',
                  isOverTrash ? 'bg-orange-200 ring-4 ring-orange-500 scale-110' : 'bg-transparent',
                ]"
              >
                <Button
                  @click="selectedTodos.length && handleDelete(selectedTodos)"
                  variant="ghost"
                  size="icon"
                  aria-label="Delete Selected"
                  class="text-orange-700"
                >
                  <Icon icon="mdi:delete" class="w-6 h-6" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div v-if="paginatedTodos.length > 0">
              <Draggable v-model="paginatedTodos" item-key="id" @remove="onTaskDrop">
                <template #item="{ element: task, index: i }">
                  <div
                    class="flex items-center gap-2 mb-2 hover:bg-gray-100 p-2 rounded-md"
                    draggable="true"
                    @dragstart="onDragStart(task)"
                  >
                    <input
                      type="checkbox"
                      :checked="selectedTodos.includes(task.id)"
                      @change="handleToggleSelect(task.id)"
                      class="accent-orange-700"
                    />
                    <RouterLink :to="`/todo/${task.id}`" class="flex-1 block hover:underline">
                      <TaskItem
                        :task="task"
                        :index="(page - 1) * pageSize + i"
                        :isLocal="parseInt(String(task.id)) > 150"
                      />
                    </RouterLink>
                  </div>
                </template>
              </Draggable>

              <div class="flex flex-wrap justify-center items-center gap-2 mt-4">
                <Button
                  variant="outline"
                  :disabled="page <= 1"
                  @click="page--"
                  class="text-orange-800"
                >
                  Prev
                </Button>

                <div class="hidden sm:flex gap-2">
                  <template v-for="(i, idx) in paginationRange" :key="idx">
                    <span v-if="i === '...'" class="px-2 text-orange-500">...</span>

                    <Button
                      v-else
                      :variant="page === i ? 'outline' : 'ghost'"
                      :disabled="page === i"
                      @click="page = i as number"
                      :class="
                        page === i
                          ? 'bg-orange-700 text-white hover:bg-orange-800'
                          : 'text-orange-800 border-orange-300'
                      "
                    >
                      {{ i }}
                    </Button>
                  </template>
                </div>

                <div class="flex sm:hidden items-center gap-2 text-orange-800">
                  <span class="font-semibold">{{ page }}</span>
                </div>

                <Button
                  variant="outline"
                  :disabled="page >= totalPages"
                  @click="page++"
                  class="text-orange-800"
                >
                  Next
                </Button>
              </div>
            </div>
            <p v-else class="text-gray-500 text-center">
              No To-Dos Found...Click on the + to begin!
            </p>
          </CardContent>
        </Card>

        <Card class="p-4 flex-1">
          <CardHeader>
            <h2 class="text-lg font-semibold mb-4 text-orange-800 text-center">Task Progress</h2>
          </CardHeader>
          <CardContent>
            <div class="mb-4">
              <div class="flex justify-between mb-1 text-orange-800">
                <span>Completed</span>
                <span>{{ stats.completedPercentage }}%</span>
              </div>
              <Progress
                :model-value="stats.completedPercentage"
                class="h-2 bg-orange-200 [&>div]:bg-orange-700"
              />
            </div>

            <div>
              <div class="flex justify-between mb-2 text-orange-800">
                <span>Pending</span>
                <span>{{ stats.pendingPercentage }}%</span>
              </div>
              <Progress
                :model-value="stats.pendingPercentage"
                class="h-2 bg-orange-200 [&>div]:bg-orange-500"
              />
            </div>
          </CardContent>
        </Card>
      </CardContent>
      <ChatBot />
    </Card>
  </MotionWrapper>
</template>
