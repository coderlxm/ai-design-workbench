<script setup lang="ts">
defineProps<{
  value: number
}>()
</script>

<template>
  <div class="progress-track" aria-label="progress">
    <div class="progress-fill" :style="{ width: `${Math.min(100, Math.max(0, value))}%` }" />
  </div>
</template>
