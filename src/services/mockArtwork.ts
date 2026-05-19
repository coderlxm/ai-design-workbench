import type { ImageAsset } from '@/types/workflow'

async function loadImage(sourceUrl: string) {
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Failed to load image: ${sourceUrl}`))
    image.src = sourceUrl
  })
}

function canvasToDataUrl(canvas: HTMLCanvasElement) {
  return canvas.toDataURL('image/png', 0.92)
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const scale = Math.max(width / image.width, height / image.height)
  const drawWidth = image.width * scale
  const drawHeight = image.height * scale
  const dx = x + (width - drawWidth) / 2
  const dy = y + (height - drawHeight) / 2
  ctx.drawImage(image, dx, dy, drawWidth, drawHeight)
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + width, y, x + width, y + height, radius)
  ctx.arcTo(x + width, y + height, x, y + height, radius)
  ctx.arcTo(x, y + height, x, y, radius)
  ctx.arcTo(x, y, x + width, y, radius)
  ctx.closePath()
}

function fillRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, fillStyle: string) {
  ctx.save()
  ctx.fillStyle = fillStyle
  roundedRect(ctx, x, y, width, height, radius)
  ctx.fill()
  ctx.restore()
}

export async function createMockLineArt(sourceUrl: string) {
  // TODO(model-api): 后续替换为真实“场景图 -> 极简线稿图”模型接口。
  const canvas = document.createElement('canvas')
  canvas.width = 1600
  canvas.height = 1200
  const ctx = canvas.getContext('2d')
  if (!ctx)
    throw new Error('Canvas not supported')

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = '#111111'
  ctx.lineWidth = 6

  try {
    const image = await loadImage(sourceUrl)
    ctx.save()
    ctx.filter = 'grayscale(1) contrast(1.8) brightness(1.2)'
    drawCover(ctx, image, 90, 70, 1420, 1020)
    ctx.restore()
  }
  catch {
    ctx.strokeRect(110, 100, 1380, 980)
  }

  ctx.strokeStyle = '#111111'
  ctx.lineWidth = 4
  for (let i = 0; i < 8; i += 1) {
    const top = 110 + i * 120
    ctx.beginPath()
    ctx.moveTo(170, top)
    ctx.lineTo(1420, top + (i % 2 === 0 ? 6 : -8))
    ctx.stroke()
  }
  ctx.beginPath()
  ctx.arc(520, 420, 130, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.rect(760, 360, 350, 230)
  ctx.stroke()
  ctx.beginPath()
  ctx.rect(200, 760, 1150, 140)
  ctx.stroke()

  return canvasToDataUrl(canvas)
}

export async function createMockFinalArtwork(options: {
  ratio: string
  productTheme: string
  scenePrompt: string
  modelPrompt: string
  sceneImage?: ImageAsset | null
  modelImages: ImageAsset[]
  lineArtUrl?: string | null
}) {
  // TODO(model-api): 后续替换为真实“最终组合 prompt -> 生图”模型接口。
  const ratioMap: Record<string, [number, number]> = {
    '1:1': [1600, 1600],
    '4:5': [1600, 2000],
    '9:16': [1440, 2560],
    '16:9': [1920, 1080],
  }
  const size = (ratioMap[options.ratio as keyof typeof ratioMap] ?? ratioMap['4:5']) as [number, number]
  const [width, height] = size
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx)
    throw new Error('Canvas not supported')

  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#f8f9fa')
  gradient.addColorStop(0.45, '#ffffff')
  gradient.addColorStop(1, '#d8f7e9')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = 'rgba(0, 109, 61, 0.12)'
  ctx.beginPath()
  ctx.arc(width * 0.84, height * 0.18, Math.min(width, height) * 0.22, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(74, 224, 141, 0.16)'
  ctx.beginPath()
  ctx.arc(width * 0.16, height * 0.78, Math.min(width, height) * 0.28, 0, Math.PI * 2)
  ctx.fill()

  fillRoundedRect(ctx, 80, 70, width - 160, height - 140, 42, 'rgba(255,255,255,0.72)')
  ctx.strokeStyle = 'rgba(0, 109, 61, 0.15)'
  ctx.lineWidth = 3
  roundedRect(ctx, 80, 70, width - 160, height - 140, 42)
  ctx.stroke()

  if (options.sceneImage?.sourceUrl) {
    try {
      const scene = await loadImage(options.sceneImage.sourceUrl)
      ctx.save()
      ctx.beginPath()
      roundedRect(ctx, 110, 120, Math.floor(width * 0.52), Math.floor(height * 0.65), 34)
      ctx.clip()
      drawCover(ctx, scene, 110, 120, Math.floor(width * 0.52), Math.floor(height * 0.65))
      ctx.restore()
    }
    catch {
      // Ignore load failures for mock output.
    }
  }

  if (options.lineArtUrl) {
    try {
      const art = await loadImage(options.lineArtUrl)
      ctx.save()
      ctx.globalAlpha = 0.26
      ctx.drawImage(art, 110, 120, Math.floor(width * 0.52), Math.floor(height * 0.65))
      ctx.restore()
    }
    catch {
      // Ignore load failures for mock output.
    }
  }

  ctx.fillStyle = '#021f12'
  ctx.font = `700 ${Math.max(38, Math.floor(width / 32))}px Inter, sans-serif`
  ctx.fillText(options.productTheme || 'AI 设计工作台', 110, height * 0.82)

  ctx.fillStyle = '#0b5f39'
  ctx.font = `500 ${Math.max(18, Math.floor(width / 84))}px Inter, sans-serif`
  ctx.fillText('商业广告视觉生成 / 美国场景 / 高一致性模特参考', 110, height * 0.87)

  const summaryBoxX = Math.floor(width * 0.62)
  const summaryBoxY = 120
  const summaryBoxW = width - summaryBoxX - 110
  fillRoundedRect(ctx, summaryBoxX, summaryBoxY, summaryBoxW, Math.floor(height * 0.42), 30, '#ffffff')
  ctx.strokeStyle = 'rgba(0, 109, 61, 0.18)'
  ctx.lineWidth = 2
  roundedRect(ctx, summaryBoxX, summaryBoxY, summaryBoxW, Math.floor(height * 0.42), 30)
  ctx.stroke()

  ctx.fillStyle = '#191c1d'
  ctx.font = '700 32px Inter, sans-serif'
  ctx.fillText('生成摘要', summaryBoxX + 28, summaryBoxY + 52)

  const summaryLines = [
    `场景：${options.scenePrompt.slice(0, 70)}${options.scenePrompt.length > 70 ? '...' : ''}`,
    `人物：${options.modelPrompt.slice(0, 70)}${options.modelPrompt.length > 70 ? '...' : ''}`,
  ]
  ctx.font = '400 24px Inter, sans-serif'
  summaryLines.forEach((line, index) => {
    const y = summaryBoxY + 104 + index * 62
    ctx.fillStyle = index === 0 ? '#3d4a3f' : '#5f5e5e'
    ctx.fillText(line, summaryBoxX + 28, y)
  })

  const chips = options.modelImages.slice(0, 4)
  chips.forEach((asset, index) => {
    const x = summaryBoxX + 28 + index * 110
    const y = summaryBoxY + Math.floor(height * 0.42) - 110
    fillRoundedRect(ctx, x, y, 92, 92, 20, '#f3f4f5')
    ctx.strokeStyle = 'rgba(0,0,0,0.07)'
    ctx.strokeRect(x, y, 92, 92)
    ctx.fillStyle = '#64748b'
    ctx.font = '500 16px Inter, sans-serif'
    ctx.fillText(asset.viewTag ?? 'ref', x + 18, y + 52)
  })

  ctx.fillStyle = '#64748b'
  ctx.font = '400 18px JetBrains Mono, monospace'
  ctx.fillText(`ratio ${options.ratio}`, summaryBoxX + 28, summaryBoxY + Math.floor(height * 0.42) - 18)

  return canvasToDataUrl(canvas)
}
