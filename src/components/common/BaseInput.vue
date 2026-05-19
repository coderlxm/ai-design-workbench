<script setup lang="ts">
const model = defineModel<string>({ default: '' })

defineProps<{
  placeholder?: string
  readonly?: boolean
}>()
</script>

<template>
  <input
    v-model="model"
    class="input base-input"
    :placeholder="placeholder"
    :readonly="readonly"
  >
</template>

<style scoped>
.base-input {
  min-height: 40px;
  padding: 0 12px;
}
</style>
