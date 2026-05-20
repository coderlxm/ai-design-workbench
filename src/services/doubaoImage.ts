import type { ImageAsset } from '@/types/workflow'

const DOUBAO_API_KEY = 'ark-a23be4d7-7563-4555-a8b2-6349db42552b-c9f9b'
const DOUBAO_IMAGE_MODEL = 'doubao-seedream-5-0-260128'
const DOUBAO_API_PATH = '/api/doubao/images/generations'

interface DoubaoImageData {
  url?: string
  b64_json?: string
}

interface DoubaoImageResponse {
  data?: DoubaoImageData[]
  error?: {
    message?: string
  }
}

function makeDataUrl(mime: string, base64: string) {
  return `data:${mime};base64,${base64}`
}

async function blobToDataUrl(blob: Blob) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('图片编码失败。'))
    reader.readAsDataURL(blob)
  })
}

function shouldConvertToDataUrl(sourceUrl: string) {
  if (sourceUrl.startsWith('data:image/'))
    return false
  if (sourceUrl.startsWith('blob:'))
    return true
  if (sourceUrl.startsWith('http://') || sourceUrl.startsWith('https://')) {
    try {
      const source = new URL(sourceUrl)
      const isLocal = ['localhost', '127.0.0.1', window.location.hostname].includes(source.hostname)
      return isLocal
    }
    catch {
      return true
    }
  }
  return true
}

async function toDoubaoImageInput(sourceUrl: string) {
  if (!shouldConvertToDataUrl(sourceUrl))
    return sourceUrl

  const response = await fetch(sourceUrl)
  if (!response.ok)
    throw new Error(`参考图读取失败：${response.status}`)
  const blob = await response.blob()
  return await blobToDataUrl(blob)
}

async function generateDoubaoImage(params: {
  prompt: string
  images?: string[]
  size?: string
}) {
  const body: Record<string, unknown> = {
    model: DOUBAO_IMAGE_MODEL,
    prompt: params.prompt,
    size: params.size ?? '2K',
    output_format: 'png',
    watermark: false,
    response_format: 'url',
  }
  if (params.images?.length)
    body.image = params.images

  const response = await fetch(DOUBAO_API_PATH, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DOUBAO_API_KEY}`,
    },
    body: JSON.stringify(body),
  })

  let result: DoubaoImageResponse = {}
  try {
    result = (await response.json()) as DoubaoImageResponse
  }
  catch {
    if (!response.ok)
      throw new Error(`豆包接口请求失败：${response.status}`)
    throw new Error('豆包接口返回了无法解析的数据。')
  }

  if (!response.ok) {
    const message = result.error?.message || `豆包接口请求失败：${response.status}`
    throw new Error(message)
  }

  const image = result.data?.[0]
  if (!image)
    throw new Error('豆包接口未返回图片。')

  if (image.url)
    return image.url
  if (image.b64_json)
    return makeDataUrl('image/png', image.b64_json)
  throw new Error('豆包接口返回格式不支持。')
}

export async function generateLineArtWithDoubao(sceneSourceUrl: string) {
  const sceneImage = await toDoubaoImageInput(sceneSourceUrl)
  return await generateDoubaoImage({
    prompt: '请将输入图片转为极简黑白线稿，白色背景，黑色线条，只保留主体轮廓与关键结构线，不要阴影，不要灰度渐变，不要任何文字、logo、水印。',
    images: [sceneImage],
    size: '2K',
  })
}

export async function generateFinalArtworkWithDoubao(options: {
  ratio: string
  prompt: string
  sceneImage?: ImageAsset | null
  modelImage?: ImageAsset | null
}) {
  const sources = [
    options.sceneImage?.sourceUrl,
    options.modelImage?.sourceUrl,
  ].filter(Boolean) as string[]

  const imageInputs = await Promise.all(sources.map(toDoubaoImageInput))
  const ratioHint = `输出比例要求：${options.ratio}。`
  return await generateDoubaoImage({
    prompt: `${options.prompt}\n${ratioHint}`,
    images: imageInputs,
    size: '2K',
  })
}
