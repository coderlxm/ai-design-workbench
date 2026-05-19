<script setup lang="ts">
defineProps<{
  text: string
}>()
</script>

<template>
  <div class="app-header-hint">
    {{ text }}
  </div>
</template>

<style scoped>
.app-header-hint {
  padding: 8px 10px;
  border-radius: 9999px;
  color: var(--primary);
  background: rgba(2, 185, 107, 0.08);
  font-size: 12px;
  font-weight: 700;
}
</style>
