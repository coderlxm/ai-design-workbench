import { defineStore } from 'pinia'

import type { WorkflowHistoryItem } from '@/types/workflow'

export const useGenerationStore = defineStore('generation', {
  state: () => ({
    lineArtUrl: '' as string,
    finalImageUrl: '' as string,
    progress: 0,
    status: 'idle' as 'idle' | 'processing' | 'completed' | 'failed',
    errorMessage: '',
    history: [] as WorkflowHistoryItem[],
    logs: ['[系统] 等待选择参考图与模型图。'],
    lastGeneratedAt: '',
  }),
  actions: {
    pushLog(message: string) {
      this.logs = [...this.logs, message].slice(-40)
    },
    setStatus(status: 'idle' | 'processing' | 'completed' | 'failed') {
      this.status = status
    },
    setProgress(value: number) {
      this.progress = Math.min(100, Math.max(0, value))
    },
    setLineArt(url: string) {
      this.lineArtUrl = url
    },
    setFinalImage(url: string) {
      this.finalImageUrl = url
    },
    setError(message: string) {
      this.errorMessage = message
      this.status = 'failed'
    },
    addHistory(item: WorkflowHistoryItem) {
      this.history = [item, ...this.history].slice(0, 12)
    },
    clearError() {
      this.errorMessage = ''
    },
  },
})
