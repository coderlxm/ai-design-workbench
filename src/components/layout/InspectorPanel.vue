<script setup lang="ts">
import { computed } from 'vue'

import BaseCard from '@/components/common/BaseCard.vue'
import BaseCheckbox from '@/components/common/BaseCheckbox.vue'
import FinalPromptDialog from '@/components/prompt/FinalPromptDialog.vue'
import PromptPanel from '@/components/prompt/PromptPanel.vue'
import ProgressBar from '@/components/common/ProgressBar.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import type { WorkflowStatus } from '@/types/workflow'

const replacePrompt = defineModel<string>('replacePrompt', { default: '' })
const enableFilterReverse = defineModel<boolean>('enableFilterReverse', { default: true })
const showFinalPrompt = defineModel<boolean>('showFinalPrompt', { default: false })

const props = defineProps<{
  status: WorkflowStatus
  progress: number
  logs: string[]
  errorMessage?: string
  sceneWarning?: string
  filterPrompt?: string
}>()

defineEmits<{
  generateReplacePrompt: []
  closeFinalPrompt: []
  save: []
  retry: []
}>()

const statusLabel = computed(() => {
  switch (props.status) {
    case 'processing':
      return '处理中'
    case 'completed':
      return '已完成'
    case 'failed':
      return '失败'
    default:
      return '空闲'
  }
})
</script>

<template>
  <div class="panel-scroll inspector-panel">
    <BaseCard title="任务状态" description="显示当前工作流执行状态与生成进度。">
      <div class="inspector-panel__status">
        <div class="inspector-panel__status-box">
          <StatusBadge :label="statusLabel" :variant="status === 'completed' ? 'success' : status === 'failed' ? 'error' : 'muted'" />
          <h3>{{ status === 'processing' ? '模型处理中' : status === 'completed' ? '任务已完成' : status === 'failed' ? '处理失败' : '等待输入' }}</h3>
          <p>{{ errorMessage || '等待选择模板或上传参考图。' }}</p>
        </div>
        <ProgressBar :value="progress" />
      </div>
    </BaseCard>

    <PromptPanel
      v-model:replace-prompt="replacePrompt"
      :scene-warning="sceneWarning"
      @generate-replace-prompt="$emit('generateReplacePrompt')"
      @view-replace-prompt="showFinalPrompt = true"
    />

    <BaseCard title="滤镜逆向" description="控制并查看隐形滤镜逆向流程。">
      <div class="inspector-panel__filter">
        <BaseCheckbox v-model="enableFilterReverse" label="启用滤镜逆向（基于原场景图）" />
        <p class="muted">
          当前状态：{{ enableFilterReverse ? '已启用' : '已关闭（将跳过滤镜逆向）' }}
        </p>
        <textarea
          class="textarea mono inspector-panel__filter-output"
          :value="filterPrompt || ''"
          readonly
          placeholder="本次执行后会在这里显示逆向得到的滤镜提示词。"
        />
      </div>
    </BaseCard>

    <BaseCard title="实时日志" description="仅保存本地工作流日志，便于验收和排查。">
      <div class="inspector-panel__logs custom-scrollbar">
        <p v-for="log in logs" :key="log">
          {{ log }}
        </p>
      </div>
    </BaseCard>

    <FinalPromptDialog
      :open="showFinalPrompt"
      :prompt-text="replacePrompt"
      @close="showFinalPrompt = false"
    />
  </div>
</template>

<style scoped>
.inspector-panel {
  display: grid;
  gap: 16px;
  padding: 16px;
}

.inspector-panel__status {
  display: grid;
  gap: 12px;
}

.inspector-panel__status-box {
  display: grid;
  gap: 8px;
}

.inspector-panel__status-box h3 {
  margin: 4px 0 0;
  font-size: 18px;
  line-height: 24px;
}

.inspector-panel__status-box p {
  margin: 0;
  color: var(--text-muted);
  font-size: 13px;
}

.inspector-panel__filter {
  display: grid;
  gap: 10px;
}

.inspector-panel__filter-output {
  min-height: 180px;
}

.inspector-panel__logs {
  max-height: 260px;
  overflow: auto;
  padding: 12px;
  border-radius: 12px;
  background: var(--inverse-surface);
  color: var(--inverse-on-surface);
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.7;
}

.inspector-panel__logs p {
  margin: 0 0 8px;
}
</style>
