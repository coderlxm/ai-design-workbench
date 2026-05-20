<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
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
import type { ImageAsset, WorkflowStepId } from '@/types/workflow'

const router = useRouter()
const workspace = useWorkspaceStore()
const assets = useAssetStore()
const prompts = usePromptStore()
const generation = useGenerationStore()

const { generateReplacePrompt, generateFinalArtwork } = useGenerationFlow()

useWorkflowPersistence()

const showFinalPrompt = ref(false)
const cropSourceUrl = ref('')
const demoScenePrefix = '/image/scenes/demo-scene-'
const demoModelPrefix = '/image/models/demo-'

function restoreLibrary() {
  const discovered = discoverLocalImageAssets()
  assets.setSceneLibrary(discovered.filter(asset => asset.kind === 'scene'))
  assets.setModelLibrary(discovered.filter(asset => asset.kind === 'model'))

  const preferredScene = assets.sceneLibrary.find(asset => asset.id.includes(`${demoScenePrefix}01`))
    ?? assets.sceneLibrary.find(asset => asset.id.includes(demoScenePrefix))

  if (!assets.selectedSceneAsset) {
    const firstScene = preferredScene ?? assets.sceneLibrary[0]
    if (firstScene)
      assets.selectScene(firstScene)
  }

  const preferredModel = assets.modelLibrary.find(asset => asset.id.includes(demoModelPrefix))
    ?? assets.modelLibrary[0]

  if (!assets.hasModelReference && preferredModel)
    assets.setModelReference(preferredModel)

  if (assets.sceneAssetForPreview && assets.hasModelReference && workspace.currentStepId === 'scene-input') {
    workspace.setStep('replace-prompt')
    generation.pushLog('[系统] 已自动加载演示素材，可直接开始生成更换人物 Prompt。')
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

function handleSelectNextScene() {
  const library = assets.sceneLibrary
  if (!library.length)
    return

  const currentIndex = library.findIndex(asset => asset.id === assets.selectedSceneAsset?.id)
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % library.length : 0
  const nextAsset = library[nextIndex]
  if (!nextAsset)
    return

  assets.selectScene(nextAsset)
  generation.pushLog(`[系统] 已切换场景图：${nextAsset.title}`)
}

function handleUploadModelReference(file: File) {
  const asset: ImageAsset = {
    id: `model-reference-${Date.now()}`,
    kind: 'model',
    title: `reference-${fileNameWithoutExt(file.name)}`,
    sourceUrl: URL.createObjectURL(file),
  }
  assets.setModelReference(asset)
  workspace.setStep('model-input')
  generation.pushLog(`[用户] 已上传模特参考图：${file.name}`)
}

function handleClearModelViews() {
  assets.clearModelViews()
  generation.pushLog('[系统] 已清空模特参考图。')
}

function handleSelectNextModelReference() {
  const library = assets.modelLibrary
  if (!library.length)
    return

  const currentIndex = library.findIndex(asset => asset.id === assets.selectedModelReference?.id)
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % library.length : 0
  const nextAsset = library[nextIndex]
  if (!nextAsset)
    return

  assets.setModelReference(nextAsset)
  generation.pushLog(`[系统] 已切换模特参考图：${nextAsset.title}`)
}

async function handleGenerateReplacePrompt() {
  try {
    await generateReplacePrompt()
    workspace.setStep('replace-prompt')
  }
  catch (error) {
    generation.setError(error instanceof Error ? error.message : '更换人物 Prompt 生成失败。')
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
  'model-input': assets.selectedModelReference?.sourceUrl,
  'replace-prompt': assets.sceneAssetForPreview?.sourceUrl,
  'final-output': generation.finalImageUrl,
}))

const sceneWarning = computed(() => {
  if (!assets.sceneAssetForPreview)
    return '请先选择模板图或上传场景图。'
  if (!assets.hasModelReference)
    return '请先上传模特参考图（单张六视图拼图）。'
  return ''
})

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
        v-model:enable-filter-reverse="workspace.enableFilterReverse"
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
      :model-views="assets.selectedModelSet"
      :final-image-url="generation.finalImageUrl"
      :is-generating="generation.status === 'processing'"
      :progress="generation.progress"
      :history="generation.history"
      @upload-scene="handleUploadScene"
      @next-scene="handleSelectNextScene"
      @crop-scene="handleCropScene"
      @reset-crop="handleResetCrop"
      @generate-replace-prompt="handleGenerateReplacePrompt"
      @upload-model-reference="handleUploadModelReference"
      @clear-model-views="handleClearModelViews"
      @next-model-reference="handleSelectNextModelReference"
      @view-final-prompt="handleOpenFinalPrompt"
      @generate-final="handleGenerateFinal"
      @download-final="handleDownloadFinal"
      @save-final="handleSaveFinal"
      @retry-final="handleRetryFinal"
      @open-records="router.push('/records')"
    />

    <template #right>
      <InspectorPanel
        v-model:replace-prompt="prompts.replacePrompt"
        v-model:enable-filter-reverse="workspace.enableFilterReverse"
        v-model:show-final-prompt="showFinalPrompt"
        :status="generation.status"
        :progress="generation.progress"
        :logs="generation.logs"
        :error-message="generation.errorMessage"
        :scene-warning="sceneWarning"
        :filter-prompt="prompts.filterPrompt"
        @generate-replace-prompt="handleGenerateReplacePrompt"
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
