const SCENE_REVERSE_API_KEY = 'app-FazlnlyHy6kLjJdbNVvVWZoP'
const SCENE_REVERSE_BASE_PATH = '/api/scene-reverse'
const SCENE_REVERSE_USER = 'ai-design-workbench'
const SCENE_UPLOAD_MAX_BYTES = 2 * 1024 * 1024
const SCENE_UPLOAD_MAX_EDGE = 1600
const JPEG_QUALITIES = [0.82, 0.72, 0.62, 0.52, 0.45]

interface SceneReverseUploadResponse {
  id?: string
  message?: string
}

interface SceneReverseChatResponse {
  answer?: string
  message?: string
}

async function parseJsonSafely<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T
  }
  catch {
    return {} as T
  }
}

function inferFileExtension(mimeType: string) {
  if (mimeType === 'image/png')
    return 'png'
  if (mimeType === 'image/webp')
    return 'webp'
  if (mimeType === 'image/gif')
    return 'gif'
  return 'jpg'
}

function getScaledSize(width: number, height: number, maxEdge: number) {
  if (Math.max(width, height) <= maxEdge)
    return { width, height }
  const scale = maxEdge / Math.max(width, height)
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

function blobToImage(blob: Blob) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(blob)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('场景图解析失败'))
    }
    image.src = objectUrl
  })
}

async function renderCompressedBlob(blob: Blob) {
  const image = await blobToImage(blob)
  const { width, height } = getScaledSize(image.naturalWidth, image.naturalHeight, SCENE_UPLOAD_MAX_EDGE)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context)
    throw new Error('场景图处理失败：无法创建画布上下文。')
  context.drawImage(image, 0, 0, width, height)

  for (const quality of JPEG_QUALITIES) {
    const encoded = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', quality))
    if (!encoded)
      continue
    if (encoded.size <= SCENE_UPLOAD_MAX_BYTES || quality === JPEG_QUALITIES[JPEG_QUALITIES.length - 1])
      return encoded
  }

  throw new Error('场景图压缩失败。')
}

async function sourceUrlToFile(sourceUrl: string) {
  const response = await fetch(sourceUrl)
  if (!response.ok)
    throw new Error(`场景图读取失败：${response.status}`)

  const sourceBlob = await response.blob()
  const sourceMimeType = sourceBlob.type || 'image/jpeg'

  if (sourceBlob.size <= SCENE_UPLOAD_MAX_BYTES) {
    const fileName = `scene-reverse.${inferFileExtension(sourceMimeType)}`
    return new File([sourceBlob], fileName, { type: sourceMimeType })
  }

  const compressedBlob = await renderCompressedBlob(sourceBlob)
  return new File([compressedBlob], 'scene-reverse.jpg', { type: 'image/jpeg' })
}

async function uploadSceneFile(sourceUrl: string) {
  const file = await sourceUrlToFile(sourceUrl)
  if (file.size > SCENE_UPLOAD_MAX_BYTES)
    throw new Error(`场景图压缩后仍过大（${Math.round(file.size / 1024)}KB），请换一张图再试。`)

  const formData = new FormData()
  formData.append('file', file)
  formData.append('user', SCENE_REVERSE_USER)

  let response: Response
  try {
    response = await fetch(`${SCENE_REVERSE_BASE_PATH}/files/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SCENE_REVERSE_API_KEY}`,
      },
      body: formData,
    })
  }
  catch {
    throw new Error('场景图上传失败：网关未返回响应，请稍后重试或更换更小的图片。')
  }

  const result = await parseJsonSafely<SceneReverseUploadResponse>(response)
  if (!response.ok)
    throw new Error(result.message || `场景图上传失败：${response.status}`)
  if (!result.id)
    throw new Error('场景图上传成功，但未返回 upload_file_id。')
  return result.id
}

function buildSceneReverseQuery(productTheme: string, sceneCountry: string) {
  return [
    '请基于上传的场景图，反推出用于广告生图的中文场景提示词。',
    `产品主题：${productTheme || '未提供'}`,
    `场景国家设定：${sceneCountry}`,
    '要求：',
    '1. 输出一段完整中文，不要分点；',
    '2. 包含主体、环境、灯光、构图、镜头语言、风格与材质；',
    '3. 不要出现任何文字、logo、字幕、水印；',
    '4. 不要添加图片中不存在的关键主体。',
  ].join('\n')
}

export async function reverseScenePromptWithApi(options: {
  sceneSourceUrl: string
  productTheme: string
  sceneCountry: string
}) {
  const uploadFileId = await uploadSceneFile(options.sceneSourceUrl)

  const response = await fetch(`${SCENE_REVERSE_BASE_PATH}/chat-messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SCENE_REVERSE_API_KEY}`,
    },
    body: JSON.stringify({
      inputs: {},
      query: buildSceneReverseQuery(options.productTheme, options.sceneCountry),
      response_mode: 'blocking',
      conversation_id: '',
      user: SCENE_REVERSE_USER,
      files: [
        {
          type: 'image',
          transfer_method: 'local_file',
          upload_file_id: uploadFileId,
        },
      ],
    }),
  })

  const result = await parseJsonSafely<SceneReverseChatResponse>(response)
  if (!response.ok)
    throw new Error(result.message || `场景反推失败：${response.status}`)

  const answer = result.answer?.trim()
  if (!answer)
    throw new Error('场景反推接口未返回有效提示词。')
  return answer
}

function buildFilterReverseQuery(productTheme: string) {
  return [
    '请基于上传的原场景图，逆向生成“滤镜优化提示词”，用于后续AI生图的光影与色彩优化。',
    `产品主题：${productTheme || '未提供'}`,
    '请严格按以下结构输出，不要省略字段，不要输出 markdown：',
    '一、视觉结论 这张图属于：____ 核心关键词：____ 整体色彩：____ 光线类型：____ 镜头语言：____',
    '二、Lightroom 参数反推 色温 Temperature：____ 色调 Tint：____ 曝光 Exposure：____ 对比 Contrast：____ 高光 Highlights：____ 阴影 Shadows：____ 白位 Whites：____ 黑位 Blacks：____ 纹理 Texture：____ 清晰度 Clarity：____ 去朦胧 Dehaze：____ 自然饱和度 Vibrance：____ 饱和度 Saturation：____',
    '三、HSL 参数 Red：H / S / L Orange：H / S / L Yellow：H / S / L Green：H / S / L Aqua：H / S / L Blue：H / S / L',
    '四、Color Grading Shadows：____ Midtones：____ Highlights：____ Blending：____ Balance：____',
    '五、镜头与摄影推测 焦段：____ 光圈：____ 快门：____ ISO：____ 景深：____ 透视：____',
    '要求：尽量给出具体数值区间，结果只基于图片内容，不要杜撰无关主体。',
  ].join('\n')
}

export async function reverseFilterPromptWithApi(options: {
  sceneSourceUrl: string
  productTheme: string
}) {
  const uploadFileId = await uploadSceneFile(options.sceneSourceUrl)

  const response = await fetch(`${SCENE_REVERSE_BASE_PATH}/chat-messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SCENE_REVERSE_API_KEY}`,
    },
    body: JSON.stringify({
      inputs: {},
      query: buildFilterReverseQuery(options.productTheme),
      response_mode: 'blocking',
      conversation_id: '',
      user: SCENE_REVERSE_USER,
      files: [
        {
          type: 'image',
          transfer_method: 'local_file',
          upload_file_id: uploadFileId,
        },
      ],
    }),
  })

  const result = await parseJsonSafely<SceneReverseChatResponse>(response)
  if (!response.ok)
    throw new Error(result.message || `滤镜反推失败：${response.status}`)

  const answer = result.answer?.trim()
  if (!answer)
    throw new Error('滤镜反推接口未返回有效提示词。')
  return answer
}
