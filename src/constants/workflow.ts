import type { WorkflowStepId } from '@/types/workflow'

export interface WorkflowStepMeta {
  id: WorkflowStepId
  title: string
  subtitle: string
  icon: string
}

export const workflowSteps: WorkflowStepMeta[] = [
  { id: 'scene-input', title: '场景输入', subtitle: '模板 / 上传 / 裁剪', icon: 'image' },
  { id: 'model-input', title: '模特输入', subtitle: '单张六视图参考图上传', icon: 'person' },
  { id: 'replace-prompt', title: '更换人物 Prompt', subtitle: '生成并校验生图指令', icon: 'auto_awesome' },
  { id: 'final-output', title: '最终产出', subtitle: '场景图 + 模特图 + Prompt 生图', icon: 'verified' },
]

export const outputRatios = ['1:1', '4:5', '9:16', '16:9'] as const

export const modelProviders = ['豆包', 'gpt-image-2', 'nano banana pro'] as const
