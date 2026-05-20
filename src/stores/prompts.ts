import { defineStore } from 'pinia'

export const usePromptStore = defineStore('prompts', {
  state: () => ({
    scenePrompt: '',
    finalPrompt: '',
    scenePromptEdited: false,
    showFinalPromptDrawer: false,
  }),
  actions: {
    setScenePrompt(value: string, edited = false) {
      this.scenePrompt = value
      this.scenePromptEdited = edited
    },
    setFinalPrompt(value: string) {
      this.finalPrompt = value
    },
  },
})
