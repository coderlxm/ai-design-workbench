<script setup lang="ts">
import { computed, ref } from 'vue'

import BaseCard from '@/components/common/BaseCard.vue'
import { downloadDataUrl } from '@/services/download'
import type { ImageAsset } from '@/types/workflow'

const props = defineProps<{
  selectedScene?: ImageAsset | null
  croppedScene?: ImageAsset | null
}>()

const emit = defineEmits<{
  uploadScene: [file: File]
  cropScene: []
  resetCrop: []
  nextScene: []
}>()

const fileInput = ref<HTMLInputElement | null>(null)

const preview = computed(() => props.croppedScene ?? props.selectedScene ?? null)

function onUploadClick() {
  fileInput.value?.click()
}

function onFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file)
    emit('uploadScene', file)
  ;(event.target as HTMLInputElement).value = ''
}

function onDownloadCurrent() {
  if (preview.value?.sourceUrl)
    downloadDataUrl(preview.value.sourceUrl, `${preview.value.title || 'scene'}.png`)
}
</script>

<template>
  <div class="workspace-stack">
    <BaseCard title="场景输入" description="上传场景图，并在裁剪后作为更换人物流程的基础图。">
      <div class="scene-input__actions">
        <button class="primary-button" type="button" @click="onUploadClick">
          <span class="material-symbols-outlined">upload</span>
          上传场景图
        </button>
        <button class="secondary-button" type="button" @click="$emit('nextScene')">
          <span class="material-symbols-outlined">skip_next</span>
          下一张
        </button>
        <button v-if="false" class="secondary-button" type="button" :disabled="!preview" @click="$emit('cropScene')">
          <span class="material-symbols-outlined">crop</span>
          主体裁剪
        </button>
        <button v-if="false" class="secondary-button" type="button" :disabled="!preview" @click="onDownloadCurrent">
          <span class="material-symbols-outlined">download</span>
          下载预览
        </button>
        <button v-if="false" class="ghost-button" type="button" :disabled="!croppedScene" @click="$emit('resetCrop')">
          重置裁剪
        </button>
      </div>
      <input ref="fileInput" class="scene-input__file" type="file" accept="image/png,image/jpeg,image/webp" @change="onFileChange">
    </BaseCard>

    <section class="image-frame">
      <header class="image-frame__header">
        <div>
          <h3 class="section-title">
            场景预览
          </h3>
          <p class="muted">
            上传后自动生成预览，可继续裁剪。
          </p>
        </div>
        <span class="tag tag-success">比例 {{ selectedScene ? '已选中' : '未选择' }}</span>
      </header>
      <div class="image-frame__body scene-preview">
        <template v-if="preview">
          <img :src="preview.sourceUrl" :alt="preview.title">
          <div class="overlay-label">
            {{ preview.title }}
          </div>
        </template>
        <div v-else class="scene-preview__empty">
          <span class="material-symbols-outlined">photo_camera</span>
          <p>尚未选择场景图</p>
          <small>可上传图片</small>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.scene-input__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.scene-input__file {
  display: none;
}

.image-frame__header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 16px 0;
}

.scene-preview {
  min-height: 480px;
}

.scene-preview img {
  width: 100%;
  height: 100%;
  min-height: 480px;
  object-fit: cover;
}

.scene-preview__empty {
  min-height: 480px;
  display: grid;
  place-items: center;
  gap: 6px;
  color: var(--text-muted);
  background:
    radial-gradient(circle at center, rgba(2, 185, 107, 0.06), transparent 40%),
    linear-gradient(180deg, #fff, #f3f4f5);
}

.scene-preview__empty .material-symbols-outlined {
  font-size: 40px;
  color: var(--primary-container);
}
</style>
