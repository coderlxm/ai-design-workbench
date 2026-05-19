<script setup lang="ts">
import IconButton from '@/components/common/IconButton.vue'

defineProps<{
  open: boolean
  finalPrompt: string
}>()

defineEmits<{
  close: []
}>()
</script>

<template>
  <div v-if="open" class="final-prompt-mask">
    <div class="final-prompt-dialog card">
      <header class="final-prompt-dialog__header">
        <div>
          <h3 class="section-title">
            最终组合 Prompt
          </h3>
          <p class="muted">
            这里用于检查最终生图入参。
          </p>
        </div>
        <IconButton icon="close" label="关闭" @click="$emit('close')" />
      </header>
      <pre class="final-prompt-dialog__body">{{ finalPrompt }}</pre>
    </div>
  </div>
</template>

<style scoped>
.final-prompt-mask {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.36);
  backdrop-filter: blur(8px);
}

.final-prompt-dialog {
  width: min(960px, 100%);
  max-height: 80vh;
  display: grid;
  gap: 16px;
  overflow: hidden;
}

.final-prompt-dialog__header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 20px 0;
}

.final-prompt-dialog__body {
  margin: 0;
  padding: 0 20px 20px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--on-surface);
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.8;
}
</style>
