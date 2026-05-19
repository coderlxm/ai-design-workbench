<script setup lang="ts">
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import { modelProviders, outputRatios } from '@/constants/workflow'

const productTheme = defineModel<string>('productTheme', { default: '' })
const selectedRatio = defineModel<string>('selectedRatio', { default: '4:5' })
const selectedModelProvider = defineModel<string>('selectedModelProvider', { default: '豆包' })

defineEmits<{
  save: []
  export: []
}>()
</script>

<template>
  <div class="top-bar__left">
    <div>
      <div class="top-bar__kicker">
        AI 设计工作台
      </div>
      <h1 class="top-bar__title">
        母婴产品工作台
      </h1>
    </div>
    <div class="top-bar__divider" />
    <div class="top-bar__fields">
      <label class="top-bar__field">
        <span>产品主题</span>
        <BaseInput v-model="productTheme" placeholder="输入产品主题" />
      </label>
      <label class="top-bar__field">
        <span>生成比例</span>
        <BaseSelect v-model="selectedRatio" :options="outputRatios" />
      </label>
      <label class="top-bar__field">
        <span>模型选择</span>
        <BaseSelect v-model="selectedModelProvider" :options="modelProviders" />
      </label>
    </div>
  </div>

  <div class="top-bar__actions">
    <button class="secondary-button" type="button" @click="$emit('export')">
      <span class="material-symbols-outlined">download</span>
      导出
    </button>
    <button class="primary-button" type="button" @click="$emit('save')">
      <span class="material-symbols-outlined">save</span>
      保存
    </button>
  </div>
</template>

<style scoped>
.top-bar__left {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.top-bar__kicker {
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.top-bar__title {
  margin: 2px 0 0;
  font-size: 18px;
  line-height: 24px;
  font-weight: 800;
  color: var(--primary);
}

.top-bar__divider {
  width: 1px;
  height: 32px;
  background: var(--border-mid);
}

.top-bar__fields {
  display: grid;
  grid-template-columns: 220px 160px 160px;
  gap: 12px;
  align-items: end;
}

.top-bar__field {
  display: grid;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
}

.top-bar__actions {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

@media (max-width: 1180px) {
  .top-bar__fields {
    grid-template-columns: 1fr;
  }
}
</style>
