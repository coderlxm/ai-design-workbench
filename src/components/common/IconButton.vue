<script setup lang="ts">
defineProps<{
  icon: string
  label?: string
  title?: string
}>()

defineEmits<{
  click: []
}>()
</script>

<template>
  <button class="icon-button" :title="title || label" @click="$emit('click')">
    <span class="material-symbols-outlined">{{ icon }}</span>
    <span v-if="label">{{ label }}</span>
  </button>
</template>

<style scoped>
.icon-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid var(--border-mid);
  border-radius: var(--radius-sm);
  background: #fff;
  color: var(--on-surface);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.icon-button:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-hover);
}

.icon-button .material-symbols-outlined {
  font-size: 18px;
}
</style>
