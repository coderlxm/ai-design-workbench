<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'

const props = defineProps<{
  open: boolean
  sourceUrl: string
}>()

const emit = defineEmits<{
  close: []
  confirm: [dataUrl: string]
}>()

const imageEl = ref<HTMLImageElement | null>(null)
let cropper: Cropper | null = null

function destroyCropper() {
  cropper?.destroy()
  cropper = null
}

function initCropper() {
  if (!props.open || !imageEl.value)
    return
  destroyCropper()
  cropper = new Cropper(imageEl.value, {
    viewMode: 1,
    dragMode: 'move',
    background: false,
    autoCropArea: 0.9,
    responsive: true,
    restore: false,
    center: true,
    highlight: false,
    zoomOnWheel: true,
    cropBoxMovable: true,
    cropBoxResizable: true,
    toggleDragModeOnDblclick: false,
  })
}

async function onConfirm() {
  if (!cropper) {
    emit('confirm', props.sourceUrl)
    return
  }
  const canvas = cropper.getCroppedCanvas({
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
    fillColor: '#ffffff',
  })
  emit('confirm', canvas.toDataURL('image/png', 0.92))
}

watch(
  () => props.open,
  async open => {
    if (open)
      await nextTick()
    if (open)
      initCropper()
    else
      destroyCropper()
  },
)

onMounted(initCropper)
onBeforeUnmount(destroyCropper)
</script>

<template>
  <div v-if="open" class="crop-dialog__mask">
    <div class="crop-dialog card">
      <header class="crop-dialog__header">
        <div>
          <h3 class="section-title">
            主体裁剪
          </h3>
          <p class="muted">
            调整场景图的主体区域，确认后用于后续线稿与生图。
          </p>
        </div>
        <button class="ghost-button" type="button" @click="$emit('close')">
          关闭
        </button>
      </header>

      <div class="crop-dialog__body">
        <img ref="imageEl" :src="sourceUrl" alt="crop source">
      </div>

      <footer class="crop-dialog__footer">
        <button class="secondary-button" type="button" @click="$emit('close')">
          取消
        </button>
        <button class="primary-button" type="button" @click="onConfirm">
          确认裁剪
        </button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.crop-dialog__mask {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.36);
  backdrop-filter: blur(8px);
}

.crop-dialog {
  width: min(1040px, 100%);
  display: grid;
  gap: 16px;
  overflow: hidden;
}

.crop-dialog__header,
.crop-dialog__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 20px 0;
}

.crop-dialog__footer {
  padding: 0 20px 20px;
}

.crop-dialog__body {
  min-height: 560px;
  padding: 0 20px;
}

.crop-dialog__body img {
  max-width: 100%;
  display: block;
}
</style>
