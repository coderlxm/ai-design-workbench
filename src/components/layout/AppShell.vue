<script setup lang="ts">
</script>

<template>
  <div class="app-shell">
    <header class="top-bar">
      <slot name="top" />
    </header>
    <div class="tri-pane">
      <aside class="left-rail">
        <slot name="left" />
      </aside>
      <main class="center-workspace custom-scrollbar">
        <slot />
      </main>
      <aside class="right-rail">
        <slot name="right" />
      </aside>
    </div>
  </div>
</template>

<style scoped>
</style>
