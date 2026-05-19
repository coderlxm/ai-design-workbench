<script setup lang="ts">
import BaseCard from '@/components/common/BaseCard.vue'
import type { ImageAsset } from '@/types/workflow'

defineProps<{
  lineArtUrl?: string | null
  sourceAsset?: ImageAsset | null
}>()

defineEmits<{
  generate: []
}>()
</script>

<template>
  <BaseCard title="线稿提取" description="将场景图转成极简黑白线稿，锁定主体结构。">
    <div class="line-art-panel__actions">
      <button class="primary-button" type="button" @click="$emit('generate')">
        <span class="material-symbols-outlined">draw</span>
        重新生成线稿
      </button>
      <span v-if="sourceAsset" class="tag tag-muted">来源：{{ sourceAsset.title }}</span>
    </div>
    <div class="line-art-panel__preview">
      <template v-if="lineArtUrl">
        <img :src="lineArtUrl" alt="line art">
      </template>
      <div v-else class="line-art-panel__empty">
        <span class="material-symbols-outlined">stroke_full</span>
        <p>暂无线稿结果</p>
      </div>
    </div>
  </BaseCard>
</template>

<style scoped>
.line-art-panel__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: 12px;
}

.line-art-panel__preview {
  min-height: 420px;
  overflow: hidden;
  border: 1px solid var(--border-mid);
  border-radius: 12px;
  background: #fff;
}

.line-art-panel__preview img {
  width: 100%;
  height: 100%;
  min-height: 420px;
  object-fit: contain;
  background: #fff;
}

.line-art-panel__empty {
  min-height: 420px;
  display: grid;
  place-items: center;
  gap: 8px;
  color: var(--text-muted);
  background: linear-gradient(180deg, #fff, #f5f7f8);
}

.line-art-panel__empty .material-symbols-outlined {
  font-size: 40px;
  color: var(--primary-container);
}
</style>
