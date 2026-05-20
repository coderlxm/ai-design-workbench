<script setup lang="ts">
import { computed } from 'vue'

import FinalOutputPanel from '@/components/preview/FinalOutputPanel.vue'
import SceneInputPanel from '@/components/preview/SceneInputPanel.vue'
import ModelReferenceGrid from '@/components/upload/ModelReferenceGrid.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import type { ImageAsset, WorkflowHistoryItem, WorkflowStepId } from '@/types/workflow'

const props = defineProps<{
  currentStepId: WorkflowStepId
  selectedScene?: ImageAsset | null
  croppedScene?: ImageAsset | null
  modelViews: ImageAsset[]
  finalImageUrl?: string | null
  progress: number
  history: WorkflowHistoryItem[]
}>()

const emit = defineEmits<{
  uploadScene: [file: File]
  cropScene: []
  resetCrop: []
  generateReplacePrompt: []
  uploadModelReference: [file: File]
  clearModelViews: []
  viewFinalPrompt: []
  generateFinal: []
  downloadFinal: []
  saveFinal: []
  retryFinal: []
  openRecords: []
}>()

const stageTitle = computed(() => {
  switch (props.currentStepId) {
    case 'scene-input':
      return '场景输入'
    case 'model-input':
      return '模特输入'
    case 'replace-prompt':
      return '更换人物 Prompt'
    case 'final-output':
      return '最终产出'
  }
})
</script>

<template>
  <div class="workspace-stage">
    <div class="workspace-stage__header">
      <div>
        <h2 class="section-title">
          {{ stageTitle }}
        </h2>
        <p class="muted">
          当前工作流的主操作区域。
        </p>
      </div>
      <span class="tag tag-success">当前流程</span>
    </div>

    <SceneInputPanel
      v-if="currentStepId === 'scene-input'"
      :selected-scene="selectedScene"
      :cropped-scene="croppedScene"
      @upload-scene="$emit('uploadScene', $event)"
      @crop-scene="$emit('cropScene')"
      @reset-crop="$emit('resetCrop')"
    />

    <BaseCard
      v-else-if="currentStepId === 'replace-prompt'"
      title="更换人物 Prompt 阶段"
      description="在右侧面板生成和编辑步骤3提示词。"
    >
      <p class="muted">
        Prompt 会约束场景构图保持不变，只替换人物外观，并在最终生图时作为核心入参。
      </p>
      <button class="primary-button" type="button" @click="$emit('generateReplacePrompt')">
        <span class="material-symbols-outlined">auto_awesome</span>
        生成更换人物 Prompt
      </button>
    </BaseCard>

    <ModelReferenceGrid
      v-else-if="currentStepId === 'model-input'"
      :assets="modelViews"
      @upload="$emit('uploadModelReference', $event)"
      @clear="$emit('clearModelViews')"
    />

    <FinalOutputPanel
      v-else
      :final-image-url="finalImageUrl"
      :progress="progress"
      :history="history"
      @generate="$emit('generateFinal')"
      @download="$emit('downloadFinal')"
      @save="$emit('saveFinal')"
      @retry="$emit('retryFinal')"
      @view-prompt="$emit('viewFinalPrompt')"
      @open-records="$emit('openRecords')"
    />
  </div>
</template>

<style scoped>
.workspace-stage {
  display: grid;
  gap: 16px;
}

.workspace-stage__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
</style>
