<script setup lang="ts">
import PromptEditorCard from '@/components/prompt/PromptEditorCard.vue'

const replacePrompt = defineModel<string>('replacePrompt', { default: '' })

withDefaults(defineProps<{
  sceneWarning?: string
  showFinalPromptSummary?: boolean
}>(), {
  showFinalPromptSummary: true,
})

defineEmits<{
  generateReplacePrompt: []
  viewReplacePrompt: []
}>()
</script>

<template>
  <div class="workspace-stack">
    <PromptEditorCard
      v-model="replacePrompt"
      title="更换人物 Prompt"
      description="生成并编辑步骤3所需的更换人物提示词。"
      generate-label="生成更换人物 Prompt"
      :warning="sceneWarning"
      @generate="$emit('generateReplacePrompt')"
    />
    <section v-if="showFinalPromptSummary" class="final-prompt-summary card">
      <header class="final-prompt-summary__header">
        <div>
          <h3 class="section-title">
            最终入参 Prompt
          </h3>
          <p class="muted">
            步骤4将直接使用该 Prompt 与图片一起生图。
          </p>
        </div>
        <button class="secondary-button" type="button" @click="$emit('viewReplacePrompt')">
          <span class="material-symbols-outlined">visibility</span>
          查看 Prompt
        </button>
      </header>
      <textarea v-model="replacePrompt" class="textarea mono" readonly />
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
