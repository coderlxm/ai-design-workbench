import type { ImageAsset } from '@/types/workflow'

const GPT_IMAGE2_API_PATH = '/api/gpt-image-2'
const NANO_BANANA_PRO_API_PATH = '/api/nano-banana-pro'
const AIGATEWAY_API_KEY = 'c1b25389ed7444c08620b37f5394108a'

interface ImageDataItem {
  b64_json?: string
  base64?: string
  url?: string
}

interface ChatImagePart {
  type?: string
  text?: string
  url?: string
  b64_json?: string
  base64?: string
  image_url?: {
    url?: string
  }
}

interface GatewayResponse {
  data?: ImageDataItem[]
  b64_json?: string
  image_base64?: string
  output?: string
  message?: string
  error?: {
    message?: string
  }
  choices?: Array<{
    message?: {
      content?: string | ChatImagePart[]
      images?: ImageDataItem[]
    }
  }>
}

function toDataUrl(base64: string, mime = 'image/png') {
  return `data:${mime};base64,${base64}`
}

function normalizeBase64(value?: string, mime = 'image/png') {
  if (!value)
    return ''
  if (value.startsWith('data:image/'))
    return value
  return toDataUrl(value.replace(/\s+/g, ''), mime)
}

function looksLikeBase64(value: string) {
  const normalized = value.replace(/\s+/g, '')
  if (normalized.length < 128)
    return false
  return /^[A-Za-z0-9+/=]+$/.test(normalized)
}

function extractImageFromObject(payload: unknown) {
  if (!payload || typeof payload !== 'object')
    return ''
  const item = payload as {
    b64_json?: string
    base64?: string
    image_base64?: string
    url?: string
    image_url?: { url?: string }
    output?: string
  }
  if (item.b64_json)
    return normalizeBase64(item.b64_json)
  if (item.base64)
    return normalizeBase64(item.base64)
  if (item.image_base64)
    return normalizeBase64(item.image_base64)
  if (item.image_url?.url)
    return item.image_url.url
  if (item.url)
    return item.url
  if (item.output)
    return item.output.startsWith('http') ? item.output : normalizeBase64(item.output)
  return ''
}

function extractImageFromText(content?: string) {
  if (!content)
    return ''
  const trimmed = content.trim()
  if (!trimmed)
    return ''
  if (trimmed.startsWith('data:image/'))
    return trimmed
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://'))
    return trimmed
  if (looksLikeBase64(trimmed))
    return normalizeBase64(trimmed)

  const candidates = [
    trimmed,
    trimmed.replace(/^```json\s*/i, '').replace(/```$/i, '').trim(),
    trimmed.replace(/^```\s*/i, '').replace(/```$/i, '').trim(),
  ]

  for (const candidate of candidates) {
    if (!candidate)
      continue
    try {
      const parsed = JSON.parse(candidate)
      const fromObject = extractImageFromObject(parsed)
      if (fromObject)
        return fromObject
    }
    catch {
      // ignore invalid JSON fragments
    }
  }
  return ''
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

async function sourceUrlToBlob(sourceUrl: string) {
  const response = await fetch(sourceUrl)
  if (!response.ok)
    throw new Error(`参考图读取失败：${response.status}`)
  return await response.blob()
}

async function toGatewayImageInput(sourceUrl: string) {
  if (!shouldConvertToDataUrl(sourceUrl))
    return sourceUrl

  const blob = await sourceUrlToBlob(sourceUrl)
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('参考图编码失败。'))
    reader.readAsDataURL(blob)
  })
}

function parseImageFromResponse(result: GatewayResponse) {
  const fromData = result.data?.[0]
  const fromMessage = result.choices?.[0]?.message
  const fromImages = fromMessage?.images?.[0]
  const content = fromMessage?.content

  const base64
    = fromData?.b64_json
      || fromData?.base64
      || result.b64_json
      || result.image_base64
      || fromImages?.b64_json
      || fromImages?.base64
  if (base64)
    return normalizeBase64(base64)

  if (Array.isArray(content)) {
    for (const part of content) {
      if (part.image_url?.url)
        return part.image_url.url
      if (part.url)
        return part.url
      if (part.b64_json)
        return normalizeBase64(part.b64_json)
      if (part.base64)
        return normalizeBase64(part.base64)
    }
  }
  else if (typeof content === 'string') {
    const fromText = extractImageFromText(content)
    if (fromText)
      return fromText
  }

  if (result.output && !result.output.startsWith('http'))
    return normalizeBase64(result.output)
  if (fromData?.url)
    return fromData.url
  if (fromImages?.url)
    return fromImages.url
  if (result.output?.startsWith('http'))
    return result.output
  return ''
}

async function parseGatewayResponse(response: Response, requestLabel: string) {
  let result: GatewayResponse = {}
  try {
    result = (await response.json()) as GatewayResponse
  }
  catch {
    if (!response.ok)
      throw new Error(`${requestLabel} 接口请求失败：${response.status}`)
    throw new Error(`${requestLabel} 接口返回了无法解析的数据。`)
  }

  if (!response.ok) {
    if (result.error?.message?.includes('Content-Type header not allow')) {
      throw new Error(`${requestLabel} 当前路由仅支持 application/json，请确认图生图代理是否指向正确的编辑接口。`)
    }
    const message = result.error?.message || result.message || `${requestLabel} 接口请求失败：${response.status}`
    throw new Error(message)
  }

  const image = parseImageFromResponse(result)
  if (!image)
    throw new Error(`${requestLabel} 接口未返回可用图片。`)
  return image
}

export async function generateFinalArtworkWithGptImage2(options: {
  finalPrompt: string
  ratio: string
  sceneImage?: ImageAsset | null
  modelImage?: ImageAsset | null
}) {
  const sourceImages = [options.sceneImage?.sourceUrl, options.modelImage?.sourceUrl].filter(Boolean) as string[]
  const imageInputs = await Promise.all(sourceImages.map(toGatewayImageInput))
  const body: Record<string, unknown> = {
    model: 'gpt-image-2',
    prompt: `${options.finalPrompt}\n输出比例为 ${options.ratio}。`,
    output_format: 'b64_json',
    n: 1,
  }
  if (imageInputs.length)
    body.images = imageInputs

  const response = await fetch(GPT_IMAGE2_API_PATH, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AIGATEWAY_API_KEY}`,
    },
    body: JSON.stringify(body),
  })

  return await parseGatewayResponse(response, 'gpt-image-2')
}

export async function generateFinalArtworkWithNanoBananaPro(options: {
  finalPrompt: string
  ratio: string
  sceneImage?: ImageAsset | null
  modelImage?: ImageAsset | null
}) {
  const sourceUrls = [options.sceneImage?.sourceUrl, options.modelImage?.sourceUrl]
    .filter((url): url is string => Boolean(url))
  const imageInputs = await Promise.all(sourceUrls.map(toGatewayImageInput))

  const response = await fetch(NANO_BANANA_PRO_API_PATH, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AIGATEWAY_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gemini-3-pro-image-preview',
      stream: false,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `${options.finalPrompt}\n输出比例要求：${options.ratio}。`,
            },
            ...imageInputs.map(url => ({
              type: 'image_url',
              image_url: { url },
            })),
          ],
        },
      ],
    }),
  })

  return await parseGatewayResponse(response, 'nano banana pro')
}
