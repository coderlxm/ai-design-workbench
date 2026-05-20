import dayjs from 'dayjs'
import { computed } from 'vue'

import { composeFinalPrompt } from '@/services/promptComposer'
import { generateFinalArtworkWithDoubao, generateLineArtWithDoubao } from '@/services/doubaoImage'
import { generateFinalArtworkWithGptImage2 } from '@/services/gptImage2'
import { reverseScenePromptWithApi } from '@/services/sceneReverse'
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
    generation.pushLog('[模型] 开始调用豆包接口生成线稿。')
    workspace.setWorkflowStatus('processing')

    const lineArt = await generateLineArtWithDoubao(sceneAsset.value.sourceUrl)
    generation.setLineArt(lineArt)
    generation.setProgress(100)
    generation.setStatus('completed')
    generation.pushLog('[模型] 豆包线稿已生成。')
    workspace.setWorkflowStatus('completed')
  }

  async function generateScenePrompt() {
    if (!sceneAsset.value?.sourceUrl)
      throw new Error('请先选择或上传场景图。')

    generation.pushLog('[模型] 开始调用场景反推接口。')
    const prompt = await reverseScenePromptWithApi({
      sceneSourceUrl: sceneAsset.value.sourceUrl,
      productTheme: workspace.productTheme,
      sceneCountry: workspace.sceneCountry,
    })
    prompts.setScenePrompt(prompt, false)
    generation.pushLog('[系统] 场景 prompt 已反推完成。')
  }

  async function generateFinalArtwork() {
    if (!sceneAsset.value)
      throw new Error('请先选择场景图。')
    if (!assets.hasEnoughModelViews)
      throw new Error('请补齐正面、左侧面、右侧面三张模特视图。')
    if (!prompts.scenePrompt)
      await generateScenePrompt()

    generation.clearError()
    generation.setStatus('processing')
    generation.setProgress(15)
    workspace.setWorkflowStatus('processing')
    generation.pushLog(`[模型] 开始最终生图（${workspace.selectedModelProvider}）。`)

    const finalPrompt = composeFinalPrompt({
      productTheme: workspace.productTheme,
      scenePrompt: prompts.scenePrompt,
      outputRatio: workspace.selectedRatio,
    })
    prompts.setFinalPrompt(finalPrompt)

    const artwork = workspace.selectedModelProvider === 'gpt-image-2'
      ? await generateFinalArtworkWithGptImage2({
          ratio: workspace.selectedRatio,
          finalPrompt,
        })
      : await generateFinalArtworkWithDoubao({
          ratio: workspace.selectedRatio,
          finalPrompt,
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
    generateFinalArtwork,
  }
}
