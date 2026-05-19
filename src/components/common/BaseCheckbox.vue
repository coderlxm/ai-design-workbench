<script setup lang="ts">
const model = defineModel<boolean>({ default: false })

defineProps<{
  label: string
}>()
</script>

<template>
  <label class="base-checkbox">
    <input v-model="model" type="checkbox">
    <span>{{ label }}</span>
  </label>
</template>

<style scoped>
.base-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--on-surface);
  font-size: 13px;
  line-height: 18px;
}

.base-checkbox input {
  width: 16px;
  height: 16px;
  accent-color: var(--primary-container);
}
</style>
