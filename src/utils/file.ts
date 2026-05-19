export function fileNameWithoutExt(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, '')
}

export function inferViewTag(fileName: string) {
  const lower = fileName.toLowerCase()

  if (lower.includes('front') || lower.includes('正面'))
    return 'front'
  if (lower.includes('left') || lower.includes('左'))
    return 'left'
  if (lower.includes('right') || lower.includes('右'))
    return 'right'
  if (lower.includes('back') || lower.includes('背'))
    return 'back'
  if (lower.includes('half') || lower.includes('半身'))
    return 'half'
  if (lower.includes('full') || lower.includes('全身'))
    return 'full'

  return undefined
}

export function formatTime(value: string | number | Date) {
  const date = new Date(value)
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
