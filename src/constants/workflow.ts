import type { WorkflowStepId } from '@/types/workflow'

export interface WorkflowStepMeta {
  id: WorkflowStepId
  title: string
  subtitle: string
  icon: string
}

export const workflowSteps: WorkflowStepMeta[] = [
  { id: 'scene-input', title: '场景输入', subtitle: '模板 / 上传 / 裁剪', icon: 'image' },
  { id: 'line-art', title: '线稿提取', subtitle: '锁定构图结构', icon: 'draw' },
  { id: 'scene-prompt', title: '场景反推', subtitle: '生成中文场景 prompt', icon: 'auto_awesome' },
  { id: 'model-input', title: '模特输入', subtitle: '六视图上传与校验', icon: 'person' },
  { id: 'final-output', title: '最终产出', subtitle: '组合 prompt 与下载', icon: 'verified' },
]

export const outputRatios = ['1:1', '4:5', '9:16', '16:9'] as const

export const modelProviders = ['豆包', 'gpt-image-2', 'gemini'] as const

export const fixedSceneCountry = '美国'
