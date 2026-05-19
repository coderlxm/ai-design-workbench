import { fileNameWithoutExt, inferViewTag } from '@/utils/file'
import type { ImageAsset } from '@/types/workflow'

const modules = import.meta.glob('/image/**/*.{png,jpg,jpeg,webp,avif,gif}', {
  eager: true,
  import: 'default',
}) as Record<string, string>

function kindFromPath(path: string): 'model' | 'scene' | null {
  if (path.includes('/models/'))
    return 'model'
  if (path.includes('/templates/'))
    return null
  return 'scene'
}

export function discoverLocalImageAssets(): ImageAsset[] {
  const assets = Object.entries(modules)
    .map(([path, sourceUrl]) => {
      const kind = kindFromPath(path)
      if (!kind)
        return null
      const fileName = path.split('/').pop() ?? path
      const viewTag = kind === 'model' ? inferViewTag(fileName) : undefined
      return {
        id: path,
        kind,
        title: fileNameWithoutExt(fileName),
        description: path,
        sourceUrl,
        viewTag,
      } satisfies ImageAsset
    })
    .filter(Boolean) as ImageAsset[]

  return assets.sort((left, right) => left.title.localeCompare(right.title, 'zh-Hans-CN'))
}
