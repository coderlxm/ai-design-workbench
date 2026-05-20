<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import BaseCard from '@/components/common/BaseCard.vue'
import { downloadDataUrl } from '@/services/download'
import { useGenerationStore } from '@/stores/generation'

const router = useRouter()
const generation = useGenerationStore()

const records = computed(() => generation.history)

function downloadRecord(url: string, productTheme: string) {
  downloadDataUrl(url, `${productTheme}.png`)
}
</script>

<template>
  <div class="records-page">
    <header class="records-page__header">
      <div>
        <p class="records-page__kicker">
          AI 设计工作台
        </p>
        <h1>生成记录</h1>
        <p>记录最近的结果与更换人物 Prompt，方便回看和下载。</p>
      </div>
      <button class="secondary-button" type="button" @click="router.push('/')">
        返回工作台
      </button>
    </header>

    <div v-if="records.length" class="records-grid">
      <BaseCard
        v-for="item in records"
        :key="item.id"
        :title="item.productTheme"
        :description="`${item.createdAt} · ${item.outputRatio}`"
      >
        <div class="records-grid__item">
          <img :src="item.finalImageUrl" :alt="item.productTheme">
          <div class="records-grid__meta">
            <p><strong>更换人物 Prompt</strong>{{ item.replacePrompt }}</p>
          </div>
          <div class="records-grid__actions">
            <button class="primary-button" type="button" @click="downloadRecord(item.finalImageUrl, item.productTheme)">
              下载
            </button>
          </div>
        </div>
      </BaseCard>
    </div>

    <BaseCard v-else title="暂无记录" description="完成一次最终生成后，记录会自动出现在这里。">
      <p>先回到工作台生成一张效果图。</p>
    </BaseCard>
  </div>
</template>

<style scoped>
.records-page {
  min-height: 100vh;
  padding: 24px;
  background: var(--background);
}

.records-page__header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.records-page__kicker {
  margin: 0 0 6px;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.records-page__header h1 {
  margin: 0;
  font-size: 30px;
  line-height: 38px;
}

.records-page__header p {
  margin: 8px 0 0;
  color: var(--text-muted);
}

.records-grid {
  display: grid;
  gap: 20px;
}

.records-grid__item {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 16px;
}

.records-grid__item img {
  width: 220px;
  height: 280px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid var(--border-mid);
}

.records-grid__meta {
  display: grid;
  gap: 12px;
}

.records-grid__meta p {
  margin: 0;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.6;
}

.records-grid__meta strong {
  display: block;
  margin-bottom: 4px;
  color: var(--on-surface);
}

.records-grid__actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
}
</style>
