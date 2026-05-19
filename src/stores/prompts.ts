import { defineStore } from 'pinia'

export const usePromptStore = defineStore('prompts', {
  state: () => ({
    scenePrompt: '',
    modelPrompt: '',
    finalPrompt: '',
    scenePromptEdited: false,
    modelPromptEdited: false,
    showFinalPromptDrawer: false,
  }),
  actions: {
    setScenePrompt(value: string, edited = false) {
      this.scenePrompt = value
      this.scenePromptEdited = edited
    },
    setModelPrompt(value: string, edited = false) {
      this.modelPrompt = value
      this.modelPromptEdited = edited
    },
    setFinalPrompt(value: string) {
      this.finalPrompt = value
    },
  },
})
