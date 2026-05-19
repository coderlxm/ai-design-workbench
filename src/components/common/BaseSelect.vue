<script setup lang="ts">
const model = defineModel<string>({ default: '' })

defineProps<{
  options: readonly string[]
}>()
</script>

<template>
  <select v-model="model" class="select base-select">
    <option v-for="option in options" :key="option" :value="option">
      {{ option }}
    </option>
  </select>
</template>

<style scoped>
.base-select {
  min-height: 40px;
  padding: 0 12px;
}
</style>
