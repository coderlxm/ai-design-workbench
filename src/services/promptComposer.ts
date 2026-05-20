import type { PromptComposePayload } from '@/types/prompt'

export function composeReplacePrompt(payload: PromptComposePayload) {
  const lines = [
    '请基于图片1作为构图结构参考，图片2作为人物外观参考，生成一张高质量商业广告摄影图。',
    '图片2是一张包含人物六视图信息的拼图，请综合该图中各视角信息保持人物外观一致性。',
    '图片1只用于锁定构图、姿态、人物轮廓、宝宝位置、产品位置、家具位置、空间关系、光线方向和画面比例；图片2只用于替换成人女性模特的外观，包括脸型、五官、发型、发色、肤色、身材比例和整体气质。请将图片2中的模特自然融合进图片1的场景中，但不要改变图片1中的人物动作、抱娃姿态、婴儿位置、产品位置、背景物体和画面构图。不要替换婴儿，不要改变产品类型，不要新增无关物品。',
  ]

  if (payload.productTheme.trim())
    lines.push(`产品主题补充：${payload.productTheme.trim()}。`)

  return lines.join('\n')
}

export function composeFinalGenerationPrompt(replacePrompt: string, filterPrompt: string) {
  if (!filterPrompt.trim())
    return replacePrompt

  return [
    replacePrompt,
    '',
    '请额外遵循以下“原场景图逆向滤镜提示词”，用于优化光影与色彩风格，并保持自然商业摄影质感：',
    filterPrompt.trim(),
  ].join('\n')
}
