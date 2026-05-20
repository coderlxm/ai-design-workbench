<script setup lang="ts">
import { computed } from 'vue'

import BaseCard from '@/components/common/BaseCard.vue'
import FinalPromptDialog from '@/components/prompt/FinalPromptDialog.vue'
import PromptPanel from '@/components/prompt/PromptPanel.vue'
import ProgressBar from '@/components/common/ProgressBar.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import type { WorkflowStatus } from '@/types/workflow'

const scenePrompt = defineModel<string>('scenePrompt', { default: '' })
const finalPrompt = defineModel<string>('finalPrompt', { default: '' })
const showFinalPrompt = defineModel<boolean>('showFinalPrompt', { default: false })

const props = defineProps<{
  status: WorkflowStatus
  progress: number
  logs: string[]
  errorMessage?: string
  sceneWarning?: string
}>()

defineEmits<{
  generateScenePrompt: []
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
      v-model:scene-prompt="scenePrompt"
      v-model:final-prompt="finalPrompt"
      :scene-warning="sceneWarning"
      @generate-scene-prompt="$emit('generateScenePrompt')"
      @view-final-prompt="showFinalPrompt = true"
    />

    <BaseCard title="实时日志" description="仅保存本地工作流日志，便于验收和排查。">
      <div class="inspector-panel__logs custom-scrollbar">
        <p v-for="log in logs" :key="log">
          {{ log }}
        </p>
      </div>
    </BaseCard>

    <FinalPromptDialog
      :open="showFinalPrompt"
      :final-prompt="finalPrompt"
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
