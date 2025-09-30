<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import LoaderComp from '../ui/LoaderComp.vue'

const avatars = [
  '/images/avatar-1.png',
  '/images/avatar-2.png',
  '/images/avatar-3.png',
  '/images/avatar-4.png',
  '/images/avatar-5.png',
  '/images/avatar-6.png',
]

const username = ref('')
const email = ref('')
const errors = ref<{ username?: string; email?: string }>({})

const selectedImage = ref<string>(avatars[0])
const isLoggingIn = ref(false)

const router = useRouter()

const validateForm = () => {
  errors.value = {}

  if (!username.value) {
    errors.value.username = 'Username is required'
  }
  if (!email.value) {
    errors.value.email = 'Email is required'
  } else if (!/\S+@\S+\.\S+/.test(email.value)) {
    errors.value.email = 'Enter a valid email'
  }

  return Object.keys(errors.value).length === 0
}

const onSubmit = () => {
  if (!validateForm()) return

  isLoggingIn.value = true

  const userData = {
    username: username.value,
    email: email.value,
    avatar: selectedImage.value,
  }
  localStorage.setItem('userData', JSON.stringify(userData))

  setTimeout(() => {
    router.push('/dashboard')
  }, 4000)
}
</script>

<template>
  <form
    @submit.prevent="onSubmit"
    class="w-full max-w-md space-y-6 text-orange-800"
    aria-label="Login form"
  >

    <div
      v-if="isLoggingIn"
      aria-label="loading spinner"
      class="flex flex-col items-center justify-center h-screen space-y-4 p-6"
    >
      <div class="relative h-72 w-72 animate-pulse">
        <img src="/images/logo.png" alt="App Logo" class="object-contain h-full w-full" />
      </div>

      <LoaderComp size="w-12 h-12" color="text-orange-800" />

      <span class="text-lg font-semibold">Logging you in...</span>
    </div>

    <template v-else>

      <div class="flex justify-center -mt-15 relative h-40 w-40 mx-auto">
        <img src="/images/logo.png" alt="App Logo" class="object-contain h-full w-full" />
      </div>

      <h1 class="text-3xl font-semibold text-center -mt-10">Login</h1>

      <div class="space-y-2">
        <Label for="username">Username</Label>
        <Input
          id="username"
          v-model="username"
          placeholder="Enter your username"
          class="w-full"
          :invalid="!!errors.username"
        />
        <span v-if="errors.username" role="alert" class="text-sm text-red-500">
          {{ errors.username }}
        </span>
      </div>

      <div class="space-y-2">
        <Label for="email">Email</Label>
        <Input
          id="email"
          type="email"
          v-model="email"
          placeholder="Enter your email"
          class="w-full"
          :invalid="!!errors.email"
        />
        <span v-if="errors.email" role="alert" class="text-sm text-red-500">
          {{ errors.email }}
        </span>
      </div>

      <div>
        <Label>Select an Avatar</Label>
        <div class="mt-2 grid grid-cols-6 gap-4 justify-items-center">
          <button
            v-for="(avatar, idx) in avatars"
            :key="idx"
            type="button"
            class="relative rounded-full p-1 border-2 transition"
            :class="selectedImage === avatar ? 'border-orange-900' : 'border-transparent'"
            @click="selectedImage = avatar"
          >
            <Avatar class="mx-auto w-12 h-12 md:w-16 md:h-16">
              <AvatarImage :src="avatar" :alt="`Avatar ${idx + 1}`" />
              <AvatarFallback>?</AvatarFallback>
            </Avatar>
          </button>
        </div>
      </div>

      <div v-if="selectedImage" class="text-center">
        <Avatar class="mx-auto w-16 h-16">
          <AvatarImage :src="selectedImage" alt="Selected avatar" />
          <AvatarFallback>?</AvatarFallback>
        </Avatar>
      </div>

      <Button type="submit" variant="default" class="w-full bg-orange-800" :disabled="isLoggingIn">
        Continue
      </Button>
    </template>
  </form>
</template>
