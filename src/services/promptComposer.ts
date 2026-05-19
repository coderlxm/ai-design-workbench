import { fixedSceneCountry } from '@/constants/workflow'
import type { PromptComposePayload } from '@/types/prompt'

export function composeScenePrompt(productTheme: string, sceneCountry = fixedSceneCountry) {
  // TODO(model-api): 后续可替换为真实场景反推接口的返回值。
  return `我想使用nano banana的模型进行生图，我需要让你帮我反推一下这张图片的提示词，并把人物场景设定为${sceneCountry}，要求按照产品主题的外观，颜色，灯光，构图，风格。请帮我尽可能详细写出他的关键词，不要出现文字，整合成一段中文。产品主题是${productTheme}。`
}

export function composeModelPrompt() {
  // TODO(model-api): 后续可替换为真实模特反推接口的返回值。
  return '你是一名专业AI人物提示词工程师。请基于输入的模特参考图，生成适合图像生成模型使用的中文人物特征提示词，详细描述人物年龄段、性别、肤色、脸型、五官、发型、身材比例、气质、服装风格，重点服务于后续保持人物一致性。'
}

export function composeFinalPrompt(payload: PromptComposePayload) {
  return [
    '请基于上传的线稿图作为构图结构参考，基于上传的模特图作为人物外观参考，生成一张符合以下要求的高质量商业广告视觉图。',
    '',
    `产品主题：${payload.productTheme}`,
    '',
    `场景设定：${payload.scenePrompt}`,
    '',
    `人物设定：${payload.modelPrompt}`,
    '',
    '构图要求：严格参考线稿图中的人物位置、姿态、主体轮廓、产品位置、空间关系和画面比例，不要大幅改变构图。',
    '人物一致性要求：参考上传的模特图，保持人物脸型、五官、发型、肤色、身材比例和整体气质一致，不要生成完全不同的人。',
    '产品与风格要求：画面需要突出产品主题，符合美国商业广告视觉风格，画面干净、高级、真实，灯光柔和，构图清晰，材质真实，适合电商广告和社媒投放。',
    '禁止项：不要出现任何文字、logo、字幕、水印、乱码、错误手指、畸形肢体、模糊面部、过度磨皮、低清画质、夸张变形、无关物品。',
    `输出要求：高清商业摄影质感，真实自然，细节清晰，主体突出，画面比例为 ${payload.outputRatio}。`,
  ].join('\n')
}
