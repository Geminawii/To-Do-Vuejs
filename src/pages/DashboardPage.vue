<!-- src/pages/Dashboard.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import localforage from 'localforage'
import Navbar from '@/components/layout/NavbarView.vue'
import Sidebar from '@/components/layout/SidebarResponsive.vue'
import MainContent from '@/components/misc/MainContent.vue'


// eslint-disable-next-line @typescript-eslint/no-explicit-any
type User = any

const user = ref<User | null>(null)
const searchTerm = ref<string>('')
const filter = ref<'all' | 'completed' | 'incomplete'>('all')

onMounted(async () => {
  const stored = await localforage.getItem<User>('userData')
  if (stored) {
    user.value = stored
  }
})
</script>

<template>
  <main class="min-h-screen bg-orange-50">
    <Navbar
      :search-term="searchTerm"
      @update:search-term="(val: string) => (searchTerm = val)"
      :filter="filter"
      @update:filter="(val: 'all' | 'completed' | 'incomplete') => (filter = val)"
    />

    <div class="flex mt-5">
      <div class="hidden lg:block sticky top-0 h-screen">
        <Sidebar />
      </div>

      <section class="flex-1 p-6 -mt-7">
        <MainContent :user="user" :search-term="searchTerm" :filter="filter" />
      </section>
    </div>
  </main>
</template>
