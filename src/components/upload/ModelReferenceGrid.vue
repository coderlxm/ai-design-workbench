<script setup lang="ts">
import { computed } from 'vue'

import type { ImageAsset } from '@/types/workflow'

const props = defineProps<{
  assets: ImageAsset[]
}>()

const emit = defineEmits<{
  upload: [file: File]
  clear: []
}>()

const selectedAsset = computed(() => props.assets[0] ?? null)

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file)
    emit('upload', file)
  input.value = ''
}
</script>

<template>
  <section class="card model-grid">
    <header class="model-grid__header">
      <div>
        <h3 class="section-title">
          模特参考图
        </h3>
        <p class="muted">
          上传 1 张包含六视图的拼图作为步骤2输入。
        </p>
      </div>
      <button class="ghost-button" type="button" :disabled="!selectedAsset" @click="emit('clear')">
        清空
      </button>
    </header>

    <div class="model-slot">
      <input class="model-slot__file" type="file" accept="image/png,image/jpeg,image/webp" @change="onFileChange">
      <template v-if="selectedAsset">
        <img :src="selectedAsset.sourceUrl" :alt="selectedAsset.title">
        <div class="model-slot__overlay">
          <strong>已上传参考图</strong>
          <span>{{ selectedAsset.title }}</span>
        </div>
      </template>
      <template v-else>
        <div class="model-slot__empty">
          <span class="material-symbols-outlined">add_photo_alternate</span>
          <strong>上传模特参考图</strong>
          <span>单图内包含六视图</span>
          <span class="model-slot__hint">点击上传</span>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.model-grid {
  padding: 16px;
  display: grid;
  gap: 16px;
}

.model-grid__header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
}

.model-slot {
  position: relative;
  min-height: 420px;
  overflow: hidden;
  border: 1px solid var(--border-mid);
  border-radius: 14px;
  background: #fff;
  cursor: pointer;
}

.model-slot__file {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.model-slot img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #fff;
}

.model-slot__overlay {
  position: absolute;
  inset: auto 0 0;
  padding: 12px;
  color: #fff;
  background: linear-gradient(180deg, transparent, rgba(15, 23, 42, 0.82));
  display: grid;
  gap: 2px;
}

.model-slot__empty {
  height: 100%;
  display: grid;
  place-items: center;
  gap: 4px;
  padding: 20px;
  text-align: center;
  color: var(--text-muted);
  background: linear-gradient(180deg, #fff, #f8f9fa);
}

.model-slot__empty strong {
  color: var(--on-surface);
}

.model-slot__hint {
  color: var(--primary);
  font-size: 12px;
}

</style>
