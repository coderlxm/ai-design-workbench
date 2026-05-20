<script setup lang="ts">
import BaseCard from '@/components/common/BaseCard.vue'
import ProgressBar from '@/components/common/ProgressBar.vue'
import IconButton from '@/components/common/IconButton.vue'
import type { WorkflowHistoryItem } from '@/types/workflow'

defineProps<{
  finalImageUrl?: string | null
  progress: number
  history: WorkflowHistoryItem[]
}>()

defineEmits<{
  generate: []
  download: []
  save: []
  retry: []
  viewPrompt: []
  openRecords: []
}>()
</script>

<template>
  <div class="workspace-stack">
    <BaseCard title="最终产出" description="基于场景图、模特图和更换人物 Prompt 生成最终图。">
      <div class="final-output__progress">
        <ProgressBar :value="progress" />
        <span class="muted">{{ progress }}%</span>
      </div>
      <div class="final-output__actions">
        <button class="primary-button" type="button" @click="$emit('generate')">
          <span class="material-symbols-outlined">play_arrow</span>
          生成效果图
        </button>
        <button class="secondary-button" type="button" @click="$emit('viewPrompt')">
          <span class="material-symbols-outlined">visibility</span>
          查看更换人物 Prompt
        </button>
        <button class="secondary-button" type="button" :disabled="!finalImageUrl" @click="$emit('download')">
          <span class="material-symbols-outlined">download</span>
          下载效果图
        </button>
        <button class="secondary-button" type="button" :disabled="!finalImageUrl" @click="$emit('save')">
          <span class="material-symbols-outlined">save</span>
          保存效果图
        </button>
        <button class="ghost-button" type="button" @click="$emit('retry')">
          <span class="material-symbols-outlined">replay</span>
          重新生成
        </button>
      </div>
    </BaseCard>

    <section class="image-frame">
      <header class="image-frame__header">
        <div>
          <h3 class="section-title">
            生成结果
          </h3>
          <p class="muted">
            这里展示生成结果。
          </p>
        </div>
        <IconButton icon="history" label="记录页" @click="$emit('openRecords')" />
      </header>
      <div class="image-frame__body final-output__preview">
        <template v-if="finalImageUrl">
          <img :src="finalImageUrl" alt="final artwork">
        </template>
        <div v-else class="final-output__empty">
          <span class="material-symbols-outlined">image</span>
          <p>尚未生成最终图片</p>
        </div>
      </div>
    </section>

    <BaseCard title="最近记录" description="保存后的工作流记录会优先显示在这里。">
      <div v-if="history.length" class="history-list">
        <article v-for="item in history.slice(0, 4)" :key="item.id" class="history-list__item">
          <img :src="item.finalImageUrl" :alt="item.productTheme">
          <div>
            <strong>{{ item.productTheme }}</strong>
            <p>{{ item.createdAt }} · {{ item.outputRatio }}</p>
          </div>
        </article>
      </div>
      <div v-else class="history-list__empty">
        暂无记录
      </div>
    </BaseCard>
  </div>
</template>

<style scoped>
.final-output__progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.final-output__progress :deep(.progress-track) {
  flex: 1;
}

.final-output__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.final-output__preview {
  min-height: 440px;
}

.final-output__preview img {
  width: 100%;
  height: 100%;
  min-height: 440px;
  object-fit: contain;
  background: #fff;
}

.final-output__empty {
  min-height: 440px;
  display: grid;
  place-items: center;
  gap: 8px;
  color: var(--text-muted);
  background: linear-gradient(180deg, #fff, #f5f7f8);
}

.final-output__empty .material-symbols-outlined {
  font-size: 40px;
  color: var(--primary-container);
}

.history-list {
  display: grid;
  gap: 12px;
}

.history-list__item {
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 12px;
  align-items: center;
}

.history-list__item img {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  object-fit: cover;
  border: 1px solid var(--border-mid);
}

.history-list__item strong {
  display: block;
  margin-bottom: 4px;
}

.history-list__item p {
  margin: 0;
  color: var(--text-muted);
  font-size: 12px;
}

.history-list__empty {
  color: var(--text-muted);
}
</style>
