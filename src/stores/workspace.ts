import { defineStore } from 'pinia'

import { modelProviders, outputRatios, workflowSteps } from '@/constants/workflow'
import type { ModelProvider, OutputRatio, WorkflowStepId, WorkflowStatus } from '@/types/workflow'

export const useWorkspaceStore = defineStore('workspace', {
  state: () => ({
    productTheme: '母婴暖奶器广告图',
    selectedRatio: outputRatios[1] as OutputRatio,
    selectedModelProvider: modelProviders[0] as ModelProvider,
    currentStepId: 'scene-input' as WorkflowStepId,
    workflowStatus: 'idle' as WorkflowStatus,
    sceneCountry: '美国',
    isCropping: false,
    activePanel: 'scene' as 'scene' | 'model' | 'final',
  }),
  getters: {
    currentStepIndex: state => workflowSteps.findIndex(step => step.id === state.currentStepId),
  },
  actions: {
    setStep(stepId: WorkflowStepId) {
      this.currentStepId = stepId
      if (stepId === 'model-input' || stepId === 'model-prompt')
        this.activePanel = 'model'
      else if (stepId === 'final-output')
        this.activePanel = 'final'
      else
        this.activePanel = 'scene'
    },
    nextStep() {
      const index = workflowSteps.findIndex(step => step.id === this.currentStepId)
      const next = workflowSteps[Math.min(index + 1, workflowSteps.length - 1)]!
      this.setStep(next.id)
    },
    previousStep() {
      const index = workflowSteps.findIndex(step => step.id === this.currentStepId)
      const prev = workflowSteps[Math.max(index - 1, 0)]!
      this.setStep(prev.id)
    },
    setWorkflowStatus(status: WorkflowStatus) {
      this.workflowStatus = status
    },
  },
})
