import dayjs from 'dayjs'
import { computed } from 'vue'

import { composeFinalGenerationPrompt, composeReplacePrompt } from '@/services/promptComposer'
import { generateFinalArtworkWithDoubao } from '@/services/doubaoImage'
import { generateFinalArtworkWithGptImage2, generateFinalArtworkWithNanoBananaPro } from '@/services/gptImage2'
import { reverseFilterPromptWithApi } from '@/services/sceneReverse'
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

  async function generateReplacePrompt() {
    if (!sceneAsset.value?.sourceUrl)
      throw new Error('请先选择或上传场景图。')
    if (!assets.hasModelReference)
      throw new Error('请先上传模特参考图（单张六视图拼图）。')

    const prompt = composeReplacePrompt({
      productTheme: workspace.productTheme,
    })
    prompts.setReplacePrompt(prompt, false)
    generation.pushLog('[系统] 更换人物 Prompt 已生成。')
  }

  async function generateFinalArtwork() {
    if (!sceneAsset.value)
      throw new Error('请先选择场景图。')
    if (!assets.hasModelReference)
      throw new Error('请先上传模特参考图（单张六视图拼图）。')
    if (!prompts.replacePrompt)
      await generateReplacePrompt()

    generation.clearError()
    generation.setStatus('processing')
    generation.setProgress(15)
    workspace.setWorkflowStatus('processing')
    generation.pushLog(`[模型] 开始最终生图（${workspace.selectedModelProvider}）。`)

    if (workspace.enableFilterReverse) {
      generation.setProgress(35)
      generation.pushLog('[模型] 开始逆向场景滤镜提示词。')
      const originalSceneSourceUrl = assets.selectedSceneAsset?.sourceUrl ?? sceneAsset.value.sourceUrl

      try {
        const filterPrompt = await reverseFilterPromptWithApi({
          sceneSourceUrl: originalSceneSourceUrl,
          productTheme: workspace.productTheme,
        })
        prompts.setFilterPrompt(filterPrompt)
        generation.pushLog('[系统] 场景滤镜提示词逆向完成。')
      }
      catch (error) {
        prompts.setFilterPrompt('')
        const message = error instanceof Error ? error.message : String(error)
        generation.pushLog(`[警告] 滤镜提示词逆向失败，已降级继续生图：${message}`)
      }
    }
    else {
      prompts.setFilterPrompt('')
      generation.pushLog('[系统] 已关闭滤镜逆向，直接使用更换人物 Prompt 生图。')
    }

    generation.setProgress(60)
    const finalPrompt = composeFinalGenerationPrompt(prompts.replacePrompt, prompts.filterPrompt)

    const artwork = workspace.selectedModelProvider === 'gpt-image-2'
      ? await generateFinalArtworkWithGptImage2({
          ratio: workspace.selectedRatio,
          finalPrompt,
          sceneImage: sceneAsset.value,
          modelImage: assets.selectedModelReference,
        })
      : workspace.selectedModelProvider === 'nano banana pro'
        ? await generateFinalArtworkWithNanoBananaPro({
            ratio: workspace.selectedRatio,
            finalPrompt,
            sceneImage: sceneAsset.value,
            modelImage: assets.selectedModelReference,
          })
        : await generateFinalArtworkWithDoubao({
            ratio: workspace.selectedRatio,
            prompt: finalPrompt,
            sceneImage: sceneAsset.value,
            modelImage: assets.selectedModelReference,
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
      replacePrompt: prompts.replacePrompt,
      finalImageUrl: artwork,
    }
    generation.addHistory(record)
    workspace.setWorkflowStatus('completed')
    workspace.setStep('final-output')
  }

  return {
    sceneAsset,
    generateReplacePrompt,
    generateFinalArtwork,
  }
}
