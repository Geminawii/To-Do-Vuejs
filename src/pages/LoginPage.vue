<!-- src/pages/Login.vue -->
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue"
import LoginForm from '../components/forms/LoginForm.vue'
import SlideshowDisplay from "@/components/misc/SlideshowDisplay.vue"


type Slide = {
  image: string
  quote: string
}

const slides: Slide[] = [
  { image: "/images/slide-1.png", quote: "The key is not in spending time, but in investing it." },
  { image: "/images/slide-2.png", quote: "Nothing makes a person more productive than the last minute." },
  { image: "/images/slide-3.png", quote: "You may delay, but time will not." },
  { image: "/images/slide-4.png", quote: "My to-do list seems to be filled with things from yesterday." },
  { image: "/images/slide-5.png", quote: "Now is never a good time to wait till later." },
]

const showForm = ref(false)
const currentSlide = ref(0)

let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % slides.length
  }, 4000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <main class="flex flex-col md:flex-row h-screen bg-white">
 
    <section class="md:hidden w-full h-full flex flex-col items-center justify-center px-4 py-6 text-orange-800">
      <LoginForm v-if="showForm" />
      <template v-else>

        <div class="relative h-40 w-40 -mt-20 flex items-center justify-center mx-auto">
          <img src="/images/logo.png" alt="App Logo" class="object-contain h-full w-full" />
        </div>

        <div class="relative h-72 w-4/5 mb-3 rounded-lg shadow-xl overflow-hidden">
          <Transition
            mode="out-in"
            enter="transition-opacity duration-500"
            enter-from="opacity-0"
            enter-to="opacity-100"
            leave="transition-opacity duration-500"
            leave-from="opacity-100"
            leave-to="opacity-0"
          >
            <img
              :key="slides[currentSlide].image"
              :src="slides[currentSlide].image"
              :alt="`Slide ${currentSlide + 1}`"
              class="object-cover rounded-lg h-full w-full"
            />
          </Transition>
        </div>


        <Transition
          mode="out-in"
          enter="transition-opacity duration-500"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="transition-opacity duration-500"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <p
            :key="slides[currentSlide].quote"
            class="text-orange-700 font-medium text-lg px-3 py-2 text-center mt-7"
          >
            {{ slides[currentSlide].quote }}
          </p>
        </Transition>


        <div class="flex justify-center mt-4 space-x-2">
          <span
            v-for="(_, index) in slides"
            :key="index"
            class="h-2 w-2 rounded-full transition-colors"
            :class="index === currentSlide ? 'bg-orange-800' : 'bg-orange-600'"
          />
        </div>


        <button
          @click="showForm = true"
          class="mt-10 w-full bg-amber-800 text-white py-2 rounded-lg"
        >
          Login
        </button>
      </template>
    </section>


    <section class="hidden md:flex w-[35%] items-center justify-center bg-white">
      <SlideshowDisplay :images="slides" />
    </section>

    <section class="hidden md:flex w-[65%] items-center justify-center px-4 bg-white">
      <LoginForm />
    </section>
  </main>
</template>
