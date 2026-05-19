import { watch } from 'vue'

import { useAssetStore } from '@/stores/assets'
import { useGenerationStore } from '@/stores/generation'
import { usePromptStore } from '@/stores/prompts'
import { useWorkspaceStore } from '@/stores/workspace'

const STORAGE_KEY = 'ai-design-workbench:v1'

function isPersistableSourceUrl(sourceUrl?: string | null) {
  return typeof sourceUrl === 'string' && !sourceUrl.startsWith('blob:')
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
      if (parsed.prompts)
        Object.assign(prompts, parsed.prompts)
      if (parsed.generation)
        Object.assign(generation, parsed.generation)
      if (parsed.assets) {
        if (parsed.assets.selectedSceneAsset && isPersistableSourceUrl(parsed.assets.selectedSceneAsset.sourceUrl))
          assets.selectedSceneAsset = parsed.assets.selectedSceneAsset
        if (parsed.assets.croppedSceneAsset && isPersistableSourceUrl(parsed.assets.croppedSceneAsset.sourceUrl))
          assets.croppedSceneAsset = parsed.assets.croppedSceneAsset
        assets.selectedModelSet = (parsed.assets.selectedModelSet ?? []).filter(asset => isPersistableSourceUrl(asset.sourceUrl))
        assets.usageRightsConfirmed = Boolean(parsed.assets.usageRightsConfirmed)
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
        usageRightsConfirmed: assets.usageRightsConfirmed,
      },
      prompts: {
        scenePrompt: prompts.scenePrompt,
        modelPrompt: prompts.modelPrompt,
        finalPrompt: prompts.finalPrompt,
        scenePromptEdited: prompts.scenePromptEdited,
        modelPromptEdited: prompts.modelPromptEdited,
      },
      generation: {
        lineArtUrl: generation.lineArtUrl,
        finalImageUrl: generation.finalImageUrl,
        progress: generation.progress,
        status: generation.status,
        errorMessage: generation.errorMessage,
        history: generation.history,
        logs: generation.logs,
        lastGeneratedAt: generation.lastGeneratedAt,
      },
    }),
    value => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    },
    { deep: true },
  )
}
