<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
}>()
</script>

<template>
  <section class="card">
    <header v-if="title || description" class="base-card__header">
      <div>
        <h3 v-if="title" class="base-card__title">
          {{ title }}
        </h3>
        <p v-if="description" class="base-card__description">
          {{ description }}
        </p>
      </div>
      <slot name="actions" />
    </header>
    <div class="base-card__body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.base-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 16px 0;
}

.base-card__title {
  margin: 0;
  font-size: 16px;
  line-height: 24px;
  font-weight: 700;
}

.base-card__description {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 18px;
}

.base-card__body {
  padding: 16px;
}
</style>
