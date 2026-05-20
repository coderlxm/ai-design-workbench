<script setup lang="ts">
import type { ModelViewAsset, ModelViewTag } from '@/types/workflow'

const props = defineProps<{
  assets: ModelViewAsset[]
}>()

const emit = defineEmits<{
  add: [viewTag: ModelViewTag, file: File]
  remove: [viewTag: ModelViewTag]
  clear: []
}>()

const slots: Array<{ tag: ModelViewTag; label: string; description: string }> = [
  { tag: 'front', label: '正面', description: '必填' },
  { tag: 'left', label: '左侧面', description: '必填' },
  { tag: 'right', label: '右侧面', description: '必填' },
  { tag: 'back', label: '背面', description: '建议' },
  { tag: 'half', label: '半身', description: '建议' },
  { tag: 'full', label: '全身', description: '建议' },
]

function assetFor(tag: ModelViewTag) {
  return props.assets.find(asset => asset.viewTag === tag)
}

function onFileChange(tag: ModelViewTag, event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file)
    emit('add', tag, file)
  input.value = ''
}
</script>

<template>
  <section class="card model-grid">
    <header class="model-grid__header">
      <div>
        <h3 class="section-title">
          模特六视图
        </h3>
        <p class="muted">
          正面、左侧面、右侧面建议必填，其他视图用于增强一致性。
        </p>
      </div>
      <button class="ghost-button" type="button" @click="emit('clear')">
        清空全部
      </button>
    </header>

    <div class="grid-template-tiles grid-6">
      <div
        v-for="slot in slots"
        :key="slot.tag"
        class="model-slot"
      >
        <input class="model-slot__file" type="file" accept="image/png,image/jpeg,image/webp" @change="onFileChange(slot.tag, $event)">
        <template v-if="assetFor(slot.tag)">
          <img :src="assetFor(slot.tag)?.sourceUrl" :alt="slot.label">
          <div class="model-slot__overlay">
            <strong>{{ slot.label }}</strong>
            <span>{{ slot.description }}</span>
          </div>
          <div class="model-slot__actions">
            <button type="button" @click.prevent="emit('remove', slot.tag)">
              删除
            </button>
          </div>
        </template>
        <template v-else>
          <div class="model-slot__empty">
            <span class="material-symbols-outlined">add_photo_alternate</span>
            <strong>{{ slot.label }}</strong>
            <span>{{ slot.description }}</span>
            <span class="model-slot__hint">点击上传</span>
          </div>
        </template>
      </div>
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
  min-height: 180px;
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
  object-fit: cover;
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

.model-slot__actions {
  position: absolute;
  top: 10px;
  right: 10px;
}

.model-slot__actions button {
  min-height: 28px;
  padding: 0 10px;
  border-radius: 9999px;
  color: #fff;
  background: rgba(17, 24, 39, 0.72);
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
