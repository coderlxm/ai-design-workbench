<script setup lang="ts">
import type { WorkflowStepId, WorkflowStatus } from '@/types/workflow'
import { workflowSteps } from '@/constants/workflow'
import StatusBadge from '@/components/common/StatusBadge.vue'

const props = defineProps<{
  currentStepId: WorkflowStepId
  workflowStatus: WorkflowStatus
  artifactThumbs: Partial<Record<WorkflowStepId, string>>
}>()

defineEmits<{
  selectStep: [stepId: WorkflowStepId]
}>()

function stepClass(stepId: WorkflowStepId) {
  const currentIndex = workflowSteps.findIndex(step => step.id === props.currentStepId)
  const index = workflowSteps.findIndex(step => step.id === stepId)
  if (stepId === props.currentStepId)
    return 'workflow-step workflow-step--active'
  if (index < currentIndex)
    return 'workflow-step workflow-step--completed'
  return 'workflow-step'
}
</script>

<template>
  <div class="panel-scroll">
    <div class="workflow-rail__header">
      <div class="workflow-rail__icon">
        <span class="material-symbols-outlined">auto_awesome</span>
      </div>
      <div>
        <h2 class="section-title">
          当前工作流
        </h2>
        <p class="muted">
          共 6 个步骤
        </p>
      </div>
      <StatusBadge :label="workflowStatus === 'processing' ? '处理中' : workflowStatus === 'completed' ? '已完成' : '待开始'" :variant="workflowStatus === 'failed' ? 'error' : workflowStatus === 'completed' ? 'success' : 'muted'" />
    </div>

    <nav class="workflow-rail__list">
      <button
        v-for="step in workflowSteps"
        :key="step.id"
        :class="stepClass(step.id)"
        type="button"
        @click="$emit('selectStep', step.id)"
      >
        <div class="workflow-rail__step-icon">
          <span class="material-symbols-outlined">{{ step.icon }}</span>
        </div>
        <div class="workflow-rail__text">
          <strong>{{ step.title }}</strong>
          <span>{{ step.subtitle }}</span>
        </div>
        <div v-if="artifactThumbs[step.id]" class="workflow-rail__thumb">
          <img :src="artifactThumbs[step.id]" :alt="step.title">
        </div>
      </button>
    </nav>

    <div class="workflow-rail__footer">
      <a class="workflow-rail__link" href="/records">
        <span class="material-symbols-outlined">description</span>
        生成记录
      </a>
      <div class="workflow-rail__hint">
        记录会自动保存到本地
      </div>
    </div>
  </div>
</template>

<style scoped>
.workflow-rail__header {
  display: grid;
  grid-template-columns: 40px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 24px 20px 16px;
  border-bottom: 1px solid var(--border-mid);
}

.workflow-rail__icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  color: #fff;
  background: var(--primary);
}

.workflow-rail__icon .material-symbols-outlined {
  font-size: 20px;
}

.workflow-rail__list {
  padding: 10px 10px 16px;
}

.workflow-step {
  width: 100%;
  display: grid;
  grid-template-columns: 36px 1fr 40px;
  gap: 12px;
  align-items: center;
  margin-bottom: 8px;
  padding: 14px 14px 14px 12px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: transparent;
  text-align: left;
}

.workflow-step:hover {
  background: rgba(2, 185, 107, 0.04);
}

.workflow-step--active {
  background: rgba(2, 185, 107, 0.08);
  border-color: rgba(2, 185, 107, 0.22);
}

.workflow-step--completed {
  color: var(--primary);
}

.workflow-rail__step-icon {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--surface-container-low);
}

.workflow-step--active .workflow-rail__step-icon {
  color: #fff;
  background: var(--primary-container);
}

.workflow-rail__text {
  display: grid;
  gap: 2px;
}

.workflow-rail__text strong {
  font-size: 14px;
  line-height: 20px;
}

.workflow-rail__text span {
  color: var(--text-muted);
  font-size: 12px;
}

.workflow-rail__thumb {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  overflow: hidden;
  background: var(--surface-container-low);
}

.workflow-rail__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.workflow-rail__footer {
  padding: 12px 20px 20px;
  border-top: 1px solid var(--border-mid);
}

.workflow-rail__link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
}

.workflow-rail__hint {
  margin-top: 8px;
  color: var(--text-muted);
  font-size: 12px;
}
</style>
