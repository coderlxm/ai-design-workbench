<script setup lang="ts">
import { computed } from 'vue'

import FinalOutputPanel from '@/components/preview/FinalOutputPanel.vue'
import LineArtPanel from '@/components/preview/LineArtPanel.vue'
import SceneInputPanel from '@/components/preview/SceneInputPanel.vue'
import ModelReferenceGrid from '@/components/upload/ModelReferenceGrid.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import type { ImageAsset, ModelViewAsset, WorkflowHistoryItem, WorkflowStepId } from '@/types/workflow'

const props = defineProps<{
  currentStepId: WorkflowStepId
  selectedScene?: ImageAsset | null
  croppedScene?: ImageAsset | null
  lineArtUrl?: string | null
  modelViews: ModelViewAsset[]
  scenePrompt: string
  finalPrompt: string
  finalImageUrl?: string | null
  progress: number
  history: WorkflowHistoryItem[]
}>()

const emit = defineEmits<{
  uploadScene: [file: File]
  cropScene: []
  resetCrop: []
  generateLineArt: []
  generateScenePrompt: []
  addModelView: [tag: ModelViewAsset['viewTag'], file: File]
  removeModelView: [tag: ModelViewAsset['viewTag']]
  clearModelViews: []
  viewFinalPrompt: []
  generateFinal: []
  downloadFinal: []
  saveFinal: []
  retryFinal: []
  openRecords: []
}>()

function handleAddModelView(tag: ModelViewAsset['viewTag'], file: File) {
  emit('addModelView', tag, file)
}

function handleRemoveModelView(tag: ModelViewAsset['viewTag']) {
  emit('removeModelView', tag)
}

const stageTitle = computed(() => {
  switch (props.currentStepId) {
    case 'scene-input':
      return '场景输入'
    case 'line-art':
      return '线稿提取'
    case 'scene-prompt':
      return '场景提示词'
    case 'model-input':
      return '模特输入'
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

    <LineArtPanel
      v-else-if="currentStepId === 'line-art'"
      :line-art-url="lineArtUrl"
      :source-asset="croppedScene || selectedScene"
      @generate="$emit('generateLineArt')"
    />

    <BaseCard
      v-else-if="currentStepId === 'scene-prompt'"
      title="场景提示词阶段"
      description="在右侧面板完成场景 prompt 编辑，这里提供推进按钮。"
    >
      <p class="muted">
        当前阶段用于展示场景 reverse prompt 的编辑结果。你可以在右侧面板微调文案后继续推进。
      </p>
      <button class="primary-button" type="button" @click="$emit('generateScenePrompt')">
        <span class="material-symbols-outlined">auto_awesome</span>
        生成场景提示词
      </button>
    </BaseCard>

    <ModelReferenceGrid
      v-else-if="currentStepId === 'model-input'"
      :assets="modelViews"
      @add="handleAddModelView"
      @remove="handleRemoveModelView"
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
