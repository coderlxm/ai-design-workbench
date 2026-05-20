<script setup lang="ts">
import PromptEditorCard from '@/components/prompt/PromptEditorCard.vue'

const scenePrompt = defineModel<string>('scenePrompt', { default: '' })
const finalPrompt = defineModel<string>('finalPrompt', { default: '' })

defineProps<{
  sceneWarning?: string
}>()

defineEmits<{
  generateScenePrompt: []
  viewFinalPrompt: []
}>()
</script>

<template>
  <div class="workspace-stack">
    <PromptEditorCard
      v-model="scenePrompt"
      title="场景提示词"
      description="展示和编辑场景逆向 prompt。"
      generate-label="反推场景"
      :warning="sceneWarning"
      @generate="$emit('generateScenePrompt')"
    />
    <section class="final-prompt-summary card">
      <header class="final-prompt-summary__header">
        <div>
          <h3 class="section-title">
            最终组合
          </h3>
          <p class="muted">
            组合产品主题与场景提示词，可继续编辑查看。
          </p>
        </div>
        <button class="secondary-button" type="button" @click="$emit('viewFinalPrompt')">
          <span class="material-symbols-outlined">visibility</span>
          查看最终 Prompt
        </button>
      </header>
      <textarea v-model="finalPrompt" class="textarea mono" readonly />
    </section>
  </div>
</template>

<style scoped>
.final-prompt-summary {
  padding: 16px;
  display: grid;
  gap: 12px;
}

.final-prompt-summary__header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
}

.final-prompt-summary textarea {
  min-height: 220px;
}
</style>
