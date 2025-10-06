<template>
  <motion.div
    :initial="{ x: -100, opacity: 0 }"
    :animate="{ x: 0, opacity: 1 }"
    :transition="{
      duration: 0.8,
      ease: 'easeOut',
      delay: delay
    }"
  >
    <slot></slot>
  </motion.div>
</template>

<script setup lang="ts">
import { motion } from 'motion-v';

interface Props {

  delay?: number;
}

withDefaults(defineProps<Props>(), {
  delay: 0,
});
</script>


