import { defineStore } from 'pinia'

export const usePromptStore = defineStore('prompts', {
  state: () => ({
    replacePrompt: '',
    filterPrompt: '',
    replacePromptEdited: false,
    showFinalPromptDrawer: false,
  }),
  actions: {
    setReplacePrompt(value: string, edited = false) {
      this.replacePrompt = value
      this.replacePromptEdited = edited
    },
    setFilterPrompt(value: string) {
      this.filterPrompt = value
    },
  },
})
