
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

interface Slide {
  image: string
  quote: string
}

interface Props {
  images: Slide[]
  interval?: number
}

const props = withDefaults(defineProps<Props>(), {
  interval: 8000,
})

const index = ref(0)
const fade = ref(true)
let timer: ReturnType<typeof setInterval> | null = null

const startSlideshow = () => {
  timer = setInterval(() => {
    fade.value = false
    setTimeout(() => {
      index.value = (index.value + 1) % props.images.length
      fade.value = true
    }, 400)
  }, props.interval)
}

onMounted(startSlideshow)

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

watch(
  () => props.interval,
  () => {
    if (timer) clearInterval(timer)
    startSlideshow()
  },
)
</script>

<template>
  <section
    aria-label="Image slideshow"
    class="w-full h-full flex flex-col items-center justify-center text-center space-y-4 px-4"
  >
    <figure class="flex flex-col items-center space-y-4">
      <img
        :src="props.images[index].image"
        :alt="`Slide ${index + 1}`"
        width="400"
        height="400"
        class="max-w-full max-h-[60vh] object-contain rounded-lg shadow-xl transform transition-all duration-1000"
        :class="fade ? 'opacity-100 scale-100' : 'opacity-0 scale-95'"
      />

      <figcaption
        class="text-lg font-medium text-orange-700 max-w-md"
        aria-live="polite"
      >
        {{ props.images[index].quote }}
      </figcaption>
    </figure>

    <div class="flex gap-2 mt-2" role="tablist">
      <button
        v-for="(slide, i) in props.images"
        :key="i"
        class="h-2 w-2 rounded-full"
        :class="i === index ? 'bg-orange-800' : 'bg-orange-700'"
        :aria-label="`Slide ${i + 1}`"
        :aria-selected="i === index"
        tabindex="0"
        @click="index = i"
      />
    </div>
  </section>
</template>
