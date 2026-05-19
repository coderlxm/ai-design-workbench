<script setup lang="ts">
import BaseTextarea from '@/components/common/BaseTextarea.vue'
import IconButton from '@/components/common/IconButton.vue'

const model = defineModel<string>({ default: '' })

defineProps<{
  title: string
  description: string
  generateLabel: string
  warning?: string
}>()

defineEmits<{
  generate: []
}>()
</script>

<template>
  <section class="prompt-card">
    <header class="prompt-card__header">
      <div>
        <h3 class="prompt-card__title">
          {{ title }}
        </h3>
        <p class="prompt-card__description">
          {{ description }}
        </p>
      </div>
      <IconButton icon="refresh" :label="generateLabel" @click="$emit('generate')" />
    </header>

    <p v-if="warning" class="prompt-card__warning">
      <span class="material-symbols-outlined">warning</span>
      {{ warning }}
    </p>

    <BaseTextarea v-model="model" :placeholder="description" />
  </section>
</template>

<style scoped>
.prompt-card {
  display: grid;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--border-mid);
  border-radius: 12px;
  background: #fff;
}

.prompt-card__header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
}

.prompt-card__title {
  margin: 0;
  font-size: 14px;
  line-height: 20px;
  font-weight: 700;
}

.prompt-card__description {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 12px;
  line-height: 18px;
}

.prompt-card__warning {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  padding: 10px 12px;
  color: var(--on-error-container);
  border-radius: 10px;
  background: rgba(255, 218, 214, 0.65);
  font-size: 12px;
}

.prompt-card__warning .material-symbols-outlined {
  font-size: 16px;
}
</style>
