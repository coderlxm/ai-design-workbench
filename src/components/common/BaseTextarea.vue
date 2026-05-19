<script setup lang="ts">
const model = defineModel<string>({ default: '' })

defineProps<{
  placeholder?: string
  readonly?: boolean
}>()
</script>

<template>
  <textarea
    v-model="model"
    class="textarea base-textarea mono"
    :placeholder="placeholder"
    :readonly="readonly"
  />
</template>

<style scoped>
.base-textarea {
  padding: 12px 14px;
  font-size: 13px;
  line-height: 18px;
}
</style>
