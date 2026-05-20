import { computed, type Ref } from 'vue'

export function useLoadingOverlay(isLoading: Ref<boolean>, progress: Ref<number>) {
  const overlayTitle = computed(() => {
    if (progress.value < 25)
      return '正在准备素材'
    if (progress.value < 55)
      return '正在优化滤镜'
    if (progress.value < 85)
      return '正在生成画面'
    return '正在完成收尾'
  })

  const overlayHint = computed(() => `${Math.min(100, Math.max(0, Math.round(progress.value)))}%`)

  return {
    showOverlay: computed(() => isLoading.value),
    overlayTitle,
    overlayHint,
  }
}
