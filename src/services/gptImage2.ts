const GPT_IMAGE2_API_PATH = '/api/gpt-image-2'
const GPT_IMAGE2_API_KEY = 'c1b25389ed7444c08620b37f5394108a'

interface GptImage2DataItem {
  b64_json?: string
  base64?: string
  url?: string
}

interface GptImage2Response {
  data?: GptImage2DataItem[]
  b64_json?: string
  image_base64?: string
  output?: string
  message?: string
  error?: {
    message?: string
  }
}

function toDataUrl(base64: string) {
  return `data:image/png;base64,${base64}`
}

function normalizeBase64(value?: string) {
  if (!value)
    return ''
  if (value.startsWith('data:image/'))
    return value
  return toDataUrl(value)
}

function parseImageFromResponse(result: GptImage2Response) {
  const fromData = result.data?.[0]
  const base64 = fromData?.b64_json || fromData?.base64 || result.b64_json || result.image_base64
  if (base64)
    return normalizeBase64(base64)

  if (result.output && !result.output.startsWith('http'))
    return normalizeBase64(result.output)
  if (fromData?.url)
    return fromData.url
  if (result.output?.startsWith('http'))
    return result.output
  return ''
}

export async function generateFinalArtworkWithGptImage2(options: {
  finalPrompt: string
  ratio: string
}) {
  const response = await fetch(GPT_IMAGE2_API_PATH, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GPT_IMAGE2_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-image-2',
      prompt: `${options.finalPrompt}\n输出比例为 ${options.ratio}。`,
      output_format: 'b64_json',
      n: 1,
    }),
  })

  let result: GptImage2Response = {}
  try {
    result = (await response.json()) as GptImage2Response
  }
  catch {
    if (!response.ok)
      throw new Error(`gpt-image-2 接口请求失败：${response.status}`)
    throw new Error('gpt-image-2 接口返回了无法解析的数据。')
  }

  if (!response.ok) {
    const message = result.error?.message || result.message || `gpt-image-2 接口请求失败：${response.status}`
    throw new Error(message)
  }

  const image = parseImageFromResponse(result)
  if (!image)
    throw new Error('gpt-image-2 接口未返回可用图片。')
  return image
}
