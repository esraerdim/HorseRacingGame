<template>
  <div class="default-layout">
    <header v-if="$slots.header" class="default-layout__header">
      <slot name="header" />
    </header>
    <main class="default-layout__content">
      <div class="default-layout__slot">
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
.default-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  gap: 0.6rem;
  padding: 0.3rem 1rem 1.3rem;
  background: var(--color-background);
  overflow: hidden;
}

.default-layout__header {
  flex-shrink: 0;
}

.default-layout__content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.default-layout__slot {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.default-layout__slot > * {
  flex: 1;
  min-height: 0;
}
</style>


