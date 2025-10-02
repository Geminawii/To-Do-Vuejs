<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Icon } from "@iconify/vue";
import { Menu } from "lucide-vue-next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";


const props = withDefaults(defineProps<{
  searchTerm?: string
  filter?: 'all' | 'completed' | 'incomplete'
}>(), {
  searchTerm: '',
  filter: 'all',
})

const emit = defineEmits<{
  (e: 'update:searchTerm', value: string): void
  (e: 'update:filter', value: 'all' | 'completed' | 'incomplete'): void
}>()



const router = useRouter();
const route = useRoute();

// Date and Time
const dateTime = ref(new Date());
let interval: number;

onMounted(() => {
  interval = window.setInterval(() => {
    dateTime.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  clearInterval(interval);
});

const currentDate = computed(() =>
  dateTime.value.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
);

const currentTime = computed(() =>
  dateTime.value.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
);

// Mobile menu
const loggingOut = ref(false);
const isDashboard = computed(() => route.path === "/dashboard");

const handleLogout = () => {
  loggingOut.value = true;
  setTimeout(() => {
    router.push("/");
  }, 3000);
};


const localSearchTerm = ref(props.searchTerm ?? "");
const localFilter = ref(props.filter ?? "all");


watch(localSearchTerm, (val) => emit('update:searchTerm', val))
watch(localFilter, (val) => emit('update:filter', val))

</script>

<template>
  <nav
    class="w-full h-20 flex justify-between items-center px-6 py-4 shadow-md bg-white"
    role="navigation"
    aria-label="Main Navigation"
  >

    <div class="flex items-center h-full" aria-label="Application Logo">
      <img
        src="/images/logo.png"
        alt="MyTodo App Logo"
        class="w-[120px] h-[120px] object-contain"
      />
    </div>

    <div class="hidden lg:flex items-center space-x-6">
      <div v-if="isDashboard && props.searchTerm !== undefined" class="relative w-48">
        <span class="absolute left-2 top-2.5 text-orange-800">
          <Icon icon="mdi:magnify" class="w-5 h-5" />
        </span>
        <Label class="sr-only">Search</Label>

        <Input
          type="text"
          placeholder="Search todos..."
          v-model="localSearchTerm"
          class="pl-8"
        />
      </div>

      <select
        v-if="isDashboard && props.filter !== undefined"
        v-model="localFilter"
        class="p-2 border rounded-md"
      >
        <option value="all">All</option>
        <option value="completed">Completed</option>
        <option value="incomplete">Incomplete</option>
      </select>

      <div class="flex flex-col text-sm text-orange-800 leading-tight" aria-label="Current Date and Time">
        <div class="flex items-center gap-1">
          <Icon icon="mdi:calendar" class="w-4 h-4" />
          <span>{{ currentDate }}</span>
        </div>
        <div class="flex items-center gap-1">
          <Icon icon="mdi:clock-outline" class="w-4 h-4" />
          <span>{{ currentTime }}</span>
        </div>
      </div>
    </div>


    <div class="lg:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="ghost" aria-label="Open Menu">
            <Menu />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="center" side="bottom" class="p-4 w-screen">
          <div v-if="isDashboard && props.searchTerm !== undefined" class="relative w-full mb-4">
            <span class="absolute left-2 top-2.5 text-orange-800">
              <Icon icon="mdi:magnify" class="w-5 h-5" />
            </span>
            <Label class="sr-only">Search</Label>

            <Input
              type="text"
              placeholder="Search todos..."
              v-model="localSearchTerm"
              class="pl-8"
            />
          </div>

          <select
            v-if="isDashboard && props.filter !== undefined"
            v-model="localFilter"
            class="p-2 border rounded-md w-full mb-4"
          >
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="incomplete">Incomplete</option>
          </select>

          <div class="flex flex-col text-sm text-gray-700 leading-tight mb-4" aria-label="Current Date and Time">
            <div class="flex items-center gap-1">
              <Icon icon="mdi:calendar" class="w-4 h-4" />
              <span>{{ currentDate }}</span>
            </div>
            <div class="flex items-center gap-1">
              <Icon icon="mdi:clock-outline" class="w-4 h-4" />
              <span>{{ currentTime }}</span>
            </div>
          </div>

          <nav class="mt-6 space-y-4 text-orange-800 text-sm font-semibold">
            <DropdownMenuItem as-child>
              <button
                @click="handleLogout"
                :disabled="loggingOut"
                class="flex items-center gap-2 text-red-600 font-semibold hover:text-red-800 p-2 rounded-md w-full"
              >
                <Icon icon="mdi:logout" />
                <span>Logout</span>
                <span v-if="loggingOut" class="animate-spin ml-1">
                  <Icon icon="mdi:loading" />
                </span>
              </button>
            </DropdownMenuItem>
          </nav>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </nav>
</template>
