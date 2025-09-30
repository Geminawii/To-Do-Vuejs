<script setup lang="ts">
import { ref, onMounted } from "vue";
import SidebarContent from "./SidebarContent.vue";
import { Menu } from "lucide-vue-next"

interface UserData {
  username?: string;
  email?: string;
  avatar?: string;
}

const userData = ref<UserData>({});

onMounted(() => {
  try {
    const raw = localStorage.getItem("userData");
    if (raw) {
      userData.value = JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Failed to parse userData:", e);
  }
});

const showMobileSidebar = ref(false);
</script>

<template>
  <div class="flex">

    <div class="hidden lg:flex">
      <SidebarContent
        :username="userData.username"
        :email="userData.email"
        :avatar="userData.avatar"
        :isMobile="false"
      />
    </div>

    <div class="lg:hidden p-4">
      <button
        class="p-2 rounded-md hover:bg-gray-100"
        aria-label="Open Sidebar"
        @click="showMobileSidebar = true"
      >
        <Menu class="h-6 w-6" />
      </button>

      <div
        v-if="showMobileSidebar"
        class="fixed inset-0 bg-black bg-opacity-50 z-40"
        @click.self="showMobileSidebar = false"
      >
        <div class="bg-white w-64 h-full p-4 shadow-lg z-50">
          <SidebarContent
            :username="userData.username"
            :email="userData.email"
            :avatar="userData.avatar"
            :isMobile="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>
