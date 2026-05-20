import { watch } from 'vue'

import { modelProviders, workflowSteps } from '@/constants/workflow'
import { useAssetStore } from '@/stores/assets'
import { useGenerationStore } from '@/stores/generation'
import { usePromptStore } from '@/stores/prompts'
import { useWorkspaceStore } from '@/stores/workspace'
import type { WorkflowHistoryItem } from '@/types/workflow'

const STORAGE_KEY = 'ai-design-workbench:v1'
const validStepIds = new Set(workflowSteps.map(step => step.id))
const validModelProviders = new Set(modelProviders)

function isPersistableSourceUrl(sourceUrl?: string | null) {
  return typeof sourceUrl === 'string'
    && !sourceUrl.startsWith('blob:')
    && !sourceUrl.startsWith('data:image/')
}

function normalizeHistory(history: unknown[]) {
  return history
    .map((item) => {
      if (!item || typeof item !== 'object')
        return null
      const record = item as Partial<WorkflowHistoryItem> & { scenePrompt?: string; finalPrompt?: string }
      if (!record.finalImageUrl || !isPersistableSourceUrl(record.finalImageUrl))
        return null
      return {
        id: String(record.id ?? Date.now()),
        createdAt: String(record.createdAt ?? ''),
        productTheme: String(record.productTheme ?? ''),
        outputRatio: (record.outputRatio ?? '4:5') as WorkflowHistoryItem['outputRatio'],
        replacePrompt: String(record.replacePrompt ?? record.finalPrompt ?? record.scenePrompt ?? ''),
        finalImageUrl: record.finalImageUrl,
      } as WorkflowHistoryItem
    })
    .filter(Boolean) as WorkflowHistoryItem[]
}

function sanitizeHistoryForStorage(history: WorkflowHistoryItem[]) {
  return normalizeHistory(history)
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
      if (!validStepIds.has(workspace.currentStepId))
        workspace.currentStepId = 'scene-input'
      if (!validModelProviders.has(workspace.selectedModelProvider))
        workspace.selectedModelProvider = modelProviders[0]
      if (parsed.prompts) {
        if (typeof parsed.prompts.replacePrompt === 'string')
          prompts.replacePrompt = parsed.prompts.replacePrompt
        else if (typeof (parsed.prompts as { finalPrompt?: string }).finalPrompt === 'string')
          prompts.replacePrompt = (parsed.prompts as { finalPrompt?: string }).finalPrompt as string
        else if (typeof (parsed.prompts as { scenePrompt?: string }).scenePrompt === 'string')
          prompts.replacePrompt = (parsed.prompts as { scenePrompt?: string }).scenePrompt as string
        if (typeof parsed.prompts.filterPrompt === 'string')
          prompts.filterPrompt = parsed.prompts.filterPrompt
        if (typeof parsed.prompts.replacePromptEdited === 'boolean')
          prompts.replacePromptEdited = parsed.prompts.replacePromptEdited
        else if (typeof (parsed.prompts as { scenePromptEdited?: boolean }).scenePromptEdited === 'boolean')
          prompts.replacePromptEdited = (parsed.prompts as { scenePromptEdited?: boolean }).scenePromptEdited as boolean
      }
      if (parsed.generation)
        Object.assign(generation, parsed.generation)
      if (!isPersistableSourceUrl(generation.finalImageUrl))
        generation.finalImageUrl = ''
      generation.history = normalizeHistory(generation.history as unknown[])
      if (parsed.assets) {
        if (parsed.assets.selectedSceneAsset && isPersistableSourceUrl(parsed.assets.selectedSceneAsset.sourceUrl))
          assets.selectedSceneAsset = parsed.assets.selectedSceneAsset
        if (parsed.assets.croppedSceneAsset && isPersistableSourceUrl(parsed.assets.croppedSceneAsset.sourceUrl))
          assets.croppedSceneAsset = parsed.assets.croppedSceneAsset
        assets.selectedModelSet = (parsed.assets.selectedModelSet ?? [])
          .filter(asset => isPersistableSourceUrl(asset.sourceUrl))
          .slice(0, 1)
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
        enableFilterReverse: workspace.enableFilterReverse,
        currentStepId: workspace.currentStepId,
        workflowStatus: workspace.workflowStatus,
        activePanel: workspace.activePanel,
      },
      assets: {
        selectedSceneAsset: isPersistableSourceUrl(assets.selectedSceneAsset?.sourceUrl) ? assets.selectedSceneAsset : null,
        croppedSceneAsset: isPersistableSourceUrl(assets.croppedSceneAsset?.sourceUrl) ? assets.croppedSceneAsset : null,
        selectedModelSet: assets.selectedModelSet
          .filter(asset => isPersistableSourceUrl(asset.sourceUrl))
          .slice(0, 1),
      },
      prompts: {
        replacePrompt: prompts.replacePrompt,
        filterPrompt: prompts.filterPrompt,
        replacePromptEdited: prompts.replacePromptEdited,
      },
      generation: {
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
