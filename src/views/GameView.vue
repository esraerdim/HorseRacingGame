<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const HorseListPanel = defineAsyncComponent(
  () => import('../components/panels/HorseListPanel.vue'),
)
const ProgramPanel = defineAsyncComponent(
  () => import('../components/panels/ProgramPanel.vue'),
)
</script>

<template>
  <main class="game-view">
    <header class="game-view__header">
      <h1>Horse Racing Game</h1>
      <p class="game-view__subtitle">
        Generate a six-round program and watch the horses race to the finish.
      </p>
    </header>

    <section class="game-view__content">
      <aside class="game-view__column game-view__column--left">
        <HorseListPanel />
      </aside>

      <section class="game-view__column game-view__column--center">
        <div class="placeholder-block">
          Race track placeholder
        </div>
      </section>

      <aside class="game-view__column game-view__column--right">
        <ProgramPanel />
        <div class="placeholder-block">
          Results panel placeholder
        </div>
      </aside>
    </section>
  </main>
</template>

<style scoped>
.game-view {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  gap: 1.5rem;
  padding: 2rem;
  background: linear-gradient(135deg, #f9fafb 0%, #edf2fb 100%);
}

.game-view__header {
  text-align: center;
}

.game-view__header h1 {
  font-size: clamp(2rem, 3vw, 2.5rem);
  font-weight: 600;
  color: #1f2937;
}

.game-view__subtitle {
  margin-top: 0.25rem;
  color: #4b5563;
  font-size: 1rem;
}

.game-view__content {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 1.5rem;
  flex: 1;
}

.game-view__column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.placeholder-block {
  flex: 1;
  display: grid;
  place-items: center;
  border-radius: 1rem;
  border: 2px dashed #cbd5f5;
  background-color: rgba(255, 255, 255, 0.8);
  color: #6b7280;
  text-align: center;
  padding: 1rem;
  font-size: 0.95rem;
  font-weight: 500;
}

@media (max-width: 1024px) {
  .game-view__content {
    grid-template-columns: 1fr;
  }
}
</style>

