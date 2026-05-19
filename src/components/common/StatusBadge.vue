<script setup lang="ts">
defineProps<{
  variant?: 'success' | 'muted' | 'warning' | 'error'
  label: string
}>()
</script>

<template>
  <span :class="['tag', `tag-${variant ?? 'muted'}`]">
    {{ label }}
  </span>
</template>
