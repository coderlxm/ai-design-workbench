export type WorkflowStepId =
  | 'scene-input'
  | 'line-art'
  | 'scene-prompt'
  | 'model-input'
  | 'model-prompt'
  | 'final-output'

export type WorkflowStatus = 'idle' | 'active' | 'processing' | 'completed' | 'failed'

export type OutputRatio = '1:1' | '4:5' | '9:16' | '16:9'

export type ModelProvider = '豆包' | 'gpt-image-2' | 'gemini'

export type AssetKind = 'scene' | 'template' | 'model'

export type ModelViewTag = 'front' | 'left' | 'right' | 'back' | 'half' | 'full'

export interface ImageAsset {
  id: string
  kind: AssetKind
  title: string
  description?: string
  sourceUrl: string
  viewTag?: ModelViewTag
  isGenerated?: boolean
}

export interface ModelViewAsset extends ImageAsset {
  kind: 'model'
  viewTag: ModelViewTag
}

export interface WorkflowHistoryItem {
  id: string
  createdAt: string
  productTheme: string
  outputRatio: OutputRatio
  scenePrompt: string
  modelPrompt: string
  finalPrompt: string
  finalImageUrl: string
}
