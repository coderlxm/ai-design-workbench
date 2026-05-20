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
  return toDataUrl(value, mime)
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

  if (!sourceImages.length) {
    const response = await fetch(GPT_IMAGE2_API_PATH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AIGATEWAY_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-image-2',
        prompt: `${options.finalPrompt}\n输出比例为 ${options.ratio}。`,
        output_format: 'b64_json',
        n: 1,
      }),
    })
    return await parseGatewayResponse(response, 'gpt-image-2')
  }

  const formData = new FormData()
  formData.append('model', 'gpt-image-2')
  formData.append('prompt', `${options.finalPrompt}\n输出比例为 ${options.ratio}。`)
  formData.append('response_format', 'b64_json')
  formData.append('n', '1')
  formData.append('size', '1536x2048')

  for (let index = 0; index < sourceImages.length; index += 1) {
    const sourceUrl = sourceImages[index]!
    const blob = await sourceUrlToBlob(sourceUrl)
    const ext = blob.type.includes('jpeg') ? 'jpg' : blob.type.includes('webp') ? 'webp' : 'png'
    formData.append('image[]', new File([blob], `reference-${index + 1}.${ext}`, { type: blob.type || 'image/png' }))
  }

  const response = await fetch(GPT_IMAGE2_API_PATH, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${AIGATEWAY_API_KEY}`,
    },
    body: formData,
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
