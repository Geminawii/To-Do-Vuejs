<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { Icon } from '@iconify/vue'
import LoaderComp from '../ui/LoaderComp.vue'

interface Props {
  username?: string
  email?: string
  avatar?: string
  isMobile: boolean
}
const props = defineProps<Props>()

const isCollapsed = ref(false)
const loggingOut = ref(false)
const hasMounted = ref(false)

const router = useRouter()

onMounted(() => {
  hasMounted.value = true
})

const handleLogout = () => {
  loggingOut.value = true
  setTimeout(() => {
    router.push('/')
  }, 3000)
}
</script>

<template>
  <aside
    class="flex flex-col justify-between p-4 border-r shadow-sm bg-white transition-all duration-500 ease-in-out sticky top-0 h-screen"
    :class="[isCollapsed && !props.isMobile ? 'w-20' : 'w-64']"
  >
    <div>
      <div class="flex flex-col items-center space-y-2">
        <div
          :class="[isCollapsed && !props.isMobile ? 'w-8 h-8' : 'w-16 h-16']"
          class=" flex items-center justify-center text-orange-800 font-bold"
        >
          <img
            v-if="props.avatar"
            :src="props.avatar"
            alt="User Avatar"
            class="rounded-full object-cover w-12 h-12"
          />
          <span v-else>
            {{ hasMounted && props.username ? props.username.charAt(0).toUpperCase() : 'U' }}
          </span>
        </div>


        <template v-if="hasMounted && !isCollapsed && !props.isMobile">
          <h2 class="text-lg font-semibold text-orange-800">{{ props.username }}</h2>
          <p class="text-sm text-gray-600 text-center">{{ props.email }}</p>
        </template>
      </div>

      <nav class="mt-6 space-y-4 text-orange-800 text-sm font-semibold">
        <RouterLink
          v-for="item in [
            { icon: 'mdi:view-dashboard', label: 'Dashboard', path: '/dashboard' },
            { icon: 'mdi:folder', label: 'Categories', path: '/categories' },
          ]"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-2 hover:text-orange-600 cursor-pointer p-2 rounded-md"
        >
          <Icon :icon="item.icon" class="w-5 h-5" />
          <span v-if="!isCollapsed">{{ item.label }}</span>
        </RouterLink>

        <button
          @click="handleLogout"
          :disabled="loggingOut"
          class="flex items-center gap-2 text-red-600 font-semibold hover:text-red-800 hover:cursor-pointer p-2 rounded-md w-full"
        >
          <Icon icon="mdi:logout" class="w-5 h-5" />
          <span v-if="!isCollapsed">
            <LoaderComp v-if="loggingOut" size="w-4 h-4" color="text-red-600" />
            <span v-else>Logout</span>
          </span>
        </button>
      </nav>
    </div>

    <button
      v-if="!props.isMobile"
      aria-label="Toggle Sidebar"
      @click="isCollapsed = !isCollapsed"
      class="absolute top-1/8 -right-4 transform -translate-y-1/2 p-1 bg-orange-800 text-gray-100 rounded-full shadow-md"
    >
      <ChevronRight v-if="isCollapsed" />
      <ChevronLeft v-else />
    </button>
  </aside>
</template>
