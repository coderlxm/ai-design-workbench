import dayjs from 'dayjs'
import { computed } from 'vue'

import { composeFinalPrompt, composeModelPrompt, composeScenePrompt } from '@/services/promptComposer'
import { createMockFinalArtwork, createMockLineArt } from '@/services/mockArtwork'
import { useAssetStore } from '@/stores/assets'
import { useGenerationStore } from '@/stores/generation'
import { usePromptStore } from '@/stores/prompts'
import { useWorkspaceStore } from '@/stores/workspace'
import type { WorkflowHistoryItem } from '@/types/workflow'

export function useGenerationFlow() {
  const workspace = useWorkspaceStore()
  const assets = useAssetStore()
  const prompts = usePromptStore()
  const generation = useGenerationStore()

  const sceneAsset = computed(() => assets.sceneAssetForPreview)

  async function generateLineArt() {
    if (!sceneAsset.value?.sourceUrl)
      throw new Error('请先选择或上传场景图。')

    generation.setStatus('processing')
    generation.setProgress(25)
    generation.pushLog('[模型] 开始生成线稿。')
    workspace.setWorkflowStatus('processing')

    const lineArt = await createMockLineArt(sceneAsset.value.sourceUrl)
    generation.setLineArt(lineArt)
    generation.setProgress(100)
    generation.setStatus('completed')
    generation.pushLog('[模型] 线稿已生成。')
    workspace.setWorkflowStatus('completed')
  }

  function generateScenePrompt() {
    const prompt = composeScenePrompt(workspace.productTheme, workspace.sceneCountry)
    prompts.setScenePrompt(prompt, false)
    generation.pushLog('[系统] 场景 prompt 已反推完成。')
  }

  function generateModelPrompt() {
    const prompt = composeModelPrompt()
    prompts.setModelPrompt(prompt, false)
    generation.pushLog('[系统] 模特 prompt 已反推完成。')
  }

  async function generateFinalArtwork() {
    if (!sceneAsset.value)
      throw new Error('请先选择场景图。')
    if (!assets.usageRightsConfirmed)
      throw new Error('请先确认模特肖像授权。')
    if (!assets.hasEnoughModelViews)
      throw new Error('请补齐正面、左侧面、右侧面三张模特视图。')
    if (!prompts.scenePrompt)
      generateScenePrompt()
    if (!prompts.modelPrompt)
      generateModelPrompt()

    generation.clearError()
    generation.setStatus('processing')
    generation.setProgress(15)
    workspace.setWorkflowStatus('processing')
    generation.pushLog('[模型] 开始最终生图。')

    const finalPrompt = composeFinalPrompt({
      productTheme: workspace.productTheme,
      scenePrompt: prompts.scenePrompt,
      modelPrompt: prompts.modelPrompt,
      outputRatio: workspace.selectedRatio,
    })
    prompts.setFinalPrompt(finalPrompt)

    const artwork = await createMockFinalArtwork({
      ratio: workspace.selectedRatio,
      productTheme: workspace.productTheme,
      scenePrompt: prompts.scenePrompt,
      modelPrompt: prompts.modelPrompt,
      sceneImage: sceneAsset.value,
      modelImages: assets.selectedModelViews,
      lineArtUrl: generation.lineArtUrl || undefined,
    })

    generation.setFinalImage(artwork)
    generation.setProgress(100)
    generation.setStatus('completed')
    generation.lastGeneratedAt = dayjs().format('YYYY-MM-DD HH:mm:ss')
    generation.pushLog('[模型] 最终图片已生成。')

    const record: WorkflowHistoryItem = {
      id: `${Date.now()}`,
      createdAt: generation.lastGeneratedAt,
      productTheme: workspace.productTheme,
      outputRatio: workspace.selectedRatio,
      scenePrompt: prompts.scenePrompt,
      modelPrompt: prompts.modelPrompt,
      finalPrompt,
      finalImageUrl: artwork,
    }
    generation.addHistory(record)
    workspace.setWorkflowStatus('completed')
    workspace.setStep('final-output')
  }

  return {
    sceneAsset,
    generateLineArt,
    generateScenePrompt,
    generateModelPrompt,
    generateFinalArtwork,
  }
}
