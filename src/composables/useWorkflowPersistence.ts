import { watch } from 'vue'

import { useAssetStore } from '@/stores/assets'
import { useGenerationStore } from '@/stores/generation'
import { usePromptStore } from '@/stores/prompts'
import { useWorkspaceStore } from '@/stores/workspace'
import type { WorkflowHistoryItem } from '@/types/workflow'

const STORAGE_KEY = 'ai-design-workbench:v1'

function isPersistableSourceUrl(sourceUrl?: string | null) {
  return typeof sourceUrl === 'string'
    && !sourceUrl.startsWith('blob:')
    && !sourceUrl.startsWith('data:image/')
}

function sanitizeHistoryForStorage(history: WorkflowHistoryItem[]) {
  return history.filter(item => isPersistableSourceUrl(item.finalImageUrl))
}

export function useWorkflowPersistence() {
  const workspace = useWorkspaceStore()
  const assets = useAssetStore()
  const prompts = usePromptStore()
  const generation = useGenerationStore()

  const state = {
    workspace,
    assets,
    prompts,
    generation,
  }

  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as Partial<typeof state>
      if (parsed.workspace)
        Object.assign(workspace, parsed.workspace)
      if (parsed.prompts) {
        if (typeof parsed.prompts.scenePrompt === 'string')
          prompts.scenePrompt = parsed.prompts.scenePrompt
        if (typeof parsed.prompts.finalPrompt === 'string')
          prompts.finalPrompt = parsed.prompts.finalPrompt
        if (typeof parsed.prompts.scenePromptEdited === 'boolean')
          prompts.scenePromptEdited = parsed.prompts.scenePromptEdited
      }
      if (parsed.generation)
        Object.assign(generation, parsed.generation)
      if (!isPersistableSourceUrl(generation.finalImageUrl))
        generation.finalImageUrl = ''
      generation.history = sanitizeHistoryForStorage(generation.history)
      if (parsed.assets) {
        if (parsed.assets.selectedSceneAsset && isPersistableSourceUrl(parsed.assets.selectedSceneAsset.sourceUrl))
          assets.selectedSceneAsset = parsed.assets.selectedSceneAsset
        if (parsed.assets.croppedSceneAsset && isPersistableSourceUrl(parsed.assets.croppedSceneAsset.sourceUrl))
          assets.croppedSceneAsset = parsed.assets.croppedSceneAsset
        assets.selectedModelSet = (parsed.assets.selectedModelSet ?? []).filter(asset => isPersistableSourceUrl(asset.sourceUrl))
      }
    }
    catch {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }

  watch(
    () => ({
      workspace: {
        productTheme: workspace.productTheme,
        selectedRatio: workspace.selectedRatio,
        selectedModelProvider: workspace.selectedModelProvider,
        currentStepId: workspace.currentStepId,
        workflowStatus: workspace.workflowStatus,
        sceneCountry: workspace.sceneCountry,
        activePanel: workspace.activePanel,
      },
      assets: {
        selectedSceneAsset: isPersistableSourceUrl(assets.selectedSceneAsset?.sourceUrl) ? assets.selectedSceneAsset : null,
        croppedSceneAsset: isPersistableSourceUrl(assets.croppedSceneAsset?.sourceUrl) ? assets.croppedSceneAsset : null,
        selectedModelSet: assets.selectedModelSet.filter(asset => isPersistableSourceUrl(asset.sourceUrl)),
      },
      prompts: {
        scenePrompt: prompts.scenePrompt,
        finalPrompt: prompts.finalPrompt,
        scenePromptEdited: prompts.scenePromptEdited,
      },
      generation: {
        lineArtUrl: generation.lineArtUrl,
        finalImageUrl: isPersistableSourceUrl(generation.finalImageUrl) ? generation.finalImageUrl : '',
        progress: generation.progress,
        status: generation.status,
        errorMessage: generation.errorMessage,
        history: sanitizeHistoryForStorage(generation.history),
        logs: generation.logs,
        lastGeneratedAt: generation.lastGeneratedAt,
      },
    }),
    value => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      }
      catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        generation.pushLog(`[系统] 本地存储写入失败：${message}`)
      }
    },
    { deep: true },
  )
}
