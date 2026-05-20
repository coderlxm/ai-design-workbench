<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import AppShell from '@/components/layout/AppShell.vue'
import InspectorPanel from '@/components/layout/InspectorPanel.vue'
import TopBar from '@/components/layout/TopBar.vue'
import WorkflowRail from '@/components/workflow/WorkflowRail.vue'
import CropDialog from '@/components/preview/CropDialog.vue'
import WorkspaceStage from '@/components/workspace/WorkspaceStage.vue'
import { discoverLocalImageAssets } from '@/services/imageDiscovery'
import { downloadDataUrl } from '@/services/download'
import { fileNameWithoutExt } from '@/utils/file'
import { useGenerationFlow } from '@/composables/useGenerationFlow'
import { useWorkflowPersistence } from '@/composables/useWorkflowPersistence'
import { useAssetStore } from '@/stores/assets'
import { useGenerationStore } from '@/stores/generation'
import { usePromptStore } from '@/stores/prompts'
import { useWorkspaceStore } from '@/stores/workspace'
import type { ImageAsset, ModelViewAsset, ModelViewTag, WorkflowStepId } from '@/types/workflow'

const router = useRouter()
const workspace = useWorkspaceStore()
const assets = useAssetStore()
const prompts = usePromptStore()
const generation = useGenerationStore()

const { generateLineArt, generateScenePrompt, generateFinalArtwork } = useGenerationFlow()

useWorkflowPersistence()

const showFinalPrompt = ref(false)
const cropSourceUrl = ref('')
const demoScenePrefix = '/image/scenes/demo-scene-'
const demoModelPrefix = '/image/models/demo-'
const preferredModelViewTags: ModelViewTag[] = ['front', 'left', 'right', 'back', 'half', 'full']

function restoreLibrary() {
  const discovered = discoverLocalImageAssets()
  assets.setSceneLibrary(discovered.filter(asset => asset.kind === 'scene'))
  assets.setModelLibrary(discovered.filter(asset => asset.kind === 'model') as ModelViewAsset[])

  const preferredScene = assets.sceneLibrary.find(asset => asset.id.includes(`${demoScenePrefix}01`))
    ?? assets.sceneLibrary.find(asset => asset.id.includes(demoScenePrefix))

  if (preferredScene && (!assets.selectedSceneAsset || !assets.selectedSceneAsset.id.includes(demoScenePrefix)))
    assets.selectScene(preferredScene)

  if (!assets.selectedSceneAsset) {
    const firstScene = assets.sceneLibrary[0]
    if (firstScene)
      assets.selectScene(firstScene)
  }

  const demoModelViews = preferredModelViewTags
    .map(viewTag => assets.modelLibrary.find(asset => asset.id.includes(demoModelPrefix) && asset.viewTag === viewTag))
    .filter(Boolean) as ModelViewAsset[]

  if (!assets.hasEnoughModelViews && demoModelViews.length >= 3) {
    assets.clearModelViews()
    demoModelViews.forEach(asset => {
      assets.addOrReplaceModelView(asset)
    })
  }

  if (assets.sceneAssetForPreview && assets.hasEnoughModelViews && workspace.currentStepId === 'scene-input') {
    workspace.setStep('line-art')
    generation.pushLog('[系统] 已自动加载演示素材，可直接开始线稿生成。')
  }
}

onMounted(() => {
  restoreLibrary()
})

function handleUploadScene(file: File) {
  const sourceUrl = URL.createObjectURL(file)
  const asset: ImageAsset = {
    id: `uploaded-scene-${Date.now()}`,
    kind: 'scene',
    title: fileNameWithoutExt(file.name),
    sourceUrl,
  }
  assets.selectScene(asset)
  workspace.setStep('scene-input')
  generation.pushLog(`[用户] 上传场景图：${file.name}`)
}

function handleCropScene() {
  const source = assets.sceneAssetForPreview
  if (!source)
    return
  cropSourceUrl.value = source.sourceUrl
  workspace.isCropping = true
}

function handleCropConfirm(dataUrl: string) {
  const base = assets.sceneAssetForPreview ?? assets.selectedSceneAsset
  if (!base)
    return
  const asset: ImageAsset = {
    id: `cropped-${Date.now()}`,
    kind: base.kind,
    title: `${base.title}-裁剪版`,
    sourceUrl: dataUrl,
  }
  assets.setCroppedScene(asset)
  workspace.isCropping = false
  generation.pushLog('[系统] 场景主体裁剪已完成。')
}

function handleResetCrop() {
  assets.setCroppedScene(null)
  generation.pushLog('[系统] 已重置裁剪结果。')
}

function handleAddModelView(viewTag: ModelViewTag, file: File) {
  const asset: ModelViewAsset = {
    id: `model-${viewTag}-${Date.now()}`,
    kind: 'model',
    viewTag,
    title: `${viewTag}-${fileNameWithoutExt(file.name)}`,
    sourceUrl: URL.createObjectURL(file),
  }
  assets.addOrReplaceModelView(asset)
  workspace.setStep('model-input')
  generation.pushLog(`[用户] 已上传模特视图：${viewTag}`)
}

function handleRemoveModelView(viewTag: ModelViewTag) {
  assets.removeModelView(viewTag)
  generation.pushLog(`[系统] 已移除模特视图：${viewTag}`)
}

function handleClearModelViews() {
  assets.clearModelViews()
  generation.pushLog('[系统] 已清空模特视图。')
}

async function handleGenerateLineArt() {
  try {
    await generateLineArt()
    workspace.setStep('line-art')
  }
  catch (error) {
    generation.setError(error instanceof Error ? error.message : '线稿生成失败。')
    generation.pushLog(`[错误] ${generation.errorMessage}`)
  }
}

async function handleGenerateScenePrompt() {
  try {
    await generateScenePrompt()
    workspace.setStep('scene-prompt')
  }
  catch (error) {
    generation.setError(error instanceof Error ? error.message : '场景反推失败。')
    generation.pushLog(`[错误] ${generation.errorMessage}`)
  }
}

function handleOpenFinalPrompt() {
  showFinalPrompt.value = true
}

async function handleGenerateFinal() {
  try {
    await generateFinalArtwork()
    showFinalPrompt.value = true
  }
  catch (error) {
    generation.setError(error instanceof Error ? error.message : '最终生图失败。')
    generation.pushLog(`[错误] ${generation.errorMessage}`)
  }
}

function handleDownloadFinal() {
  if (!generation.finalImageUrl)
    return
  downloadDataUrl(generation.finalImageUrl, `${workspace.productTheme || 'final-artwork'}.png`)
  generation.pushLog('[系统] 已下载最终图片。')
}

function handleSaveFinal() {
  generation.pushLog('[系统] 效果图已保存到本地记录。')
}

function handleRetryFinal() {
  void handleGenerateFinal()
}

function handleSelectStep(stepId: WorkflowStepId) {
  workspace.setStep(stepId)
}

function handleSaveProject() {
  generation.pushLog('[系统] 当前工作流状态已保存。')
}

function handleExportProject() {
  handleDownloadFinal()
}

const artifactThumbs = computed<Partial<Record<WorkflowStepId, string>>>(() => ({
  'scene-input': assets.sceneAssetForPreview?.sourceUrl,
  'line-art': generation.lineArtUrl,
  'scene-prompt': assets.sceneAssetForPreview?.sourceUrl,
  'model-input': assets.selectedModelViews[0]?.sourceUrl,
  'final-output': generation.finalImageUrl,
}))

const sceneWarning = computed(() => {
  if (!assets.sceneAssetForPreview)
    return '请先选择模板图或上传场景图。'
  return workspace.sceneCountry !== '美国' ? '场景已锁定为美国，当前输入不会改变该设定。' : ''
})

watch(
  () => [workspace.productTheme, workspace.selectedRatio, workspace.selectedModelProvider],
  () => {
    if (prompts.scenePromptEdited)
      return
    if (prompts.scenePrompt)
      prompts.setScenePrompt(prompts.scenePrompt, false)
  },
)

onBeforeUnmount(() => {
  if (workspace.isCropping)
    workspace.isCropping = false
})
</script>

<template>
  <AppShell>
    <template #top>
      <TopBar
        v-model:product-theme="workspace.productTheme"
        v-model:selected-ratio="workspace.selectedRatio"
        v-model:selected-model-provider="workspace.selectedModelProvider"
        @save="handleSaveProject"
        @export="handleExportProject"
      />
    </template>

    <template #left>
      <WorkflowRail
        :current-step-id="workspace.currentStepId"
        :workflow-status="generation.status"
        :artifact-thumbs="artifactThumbs"
        @select-step="handleSelectStep"
      />
    </template>

    <WorkspaceStage
      :current-step-id="workspace.currentStepId"
      :selected-scene="assets.selectedSceneAsset"
      :cropped-scene="assets.croppedSceneAsset"
      :line-art-url="generation.lineArtUrl"
      :model-views="assets.selectedModelSet"
      :scene-prompt="prompts.scenePrompt"
      :final-prompt="prompts.finalPrompt"
      :final-image-url="generation.finalImageUrl"
      :progress="generation.progress"
      :history="generation.history"
      @upload-scene="handleUploadScene"
      @crop-scene="handleCropScene"
      @reset-crop="handleResetCrop"
      @generate-line-art="handleGenerateLineArt"
      @generate-scene-prompt="handleGenerateScenePrompt"
      @add-model-view="handleAddModelView"
      @remove-model-view="handleRemoveModelView"
      @clear-model-views="handleClearModelViews"
      @view-final-prompt="handleOpenFinalPrompt"
      @generate-final="handleGenerateFinal"
      @download-final="handleDownloadFinal"
      @save-final="handleSaveFinal"
      @retry-final="handleRetryFinal"
      @open-records="router.push('/records')"
    />

    <template #right>
      <InspectorPanel
        v-model:scene-prompt="prompts.scenePrompt"
        v-model:final-prompt="prompts.finalPrompt"
        v-model:show-final-prompt="showFinalPrompt"
        :status="generation.status"
        :progress="generation.progress"
        :logs="generation.logs"
        :error-message="generation.errorMessage"
        :scene-warning="sceneWarning"
        @generate-scene-prompt="handleGenerateScenePrompt"
      />
    </template>
  </AppShell>

  <CropDialog
    :open="workspace.isCropping"
    :source-url="cropSourceUrl"
    @close="workspace.isCropping = false"
    @confirm="handleCropConfirm"
  />
</template>
