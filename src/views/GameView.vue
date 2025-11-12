<script setup lang="ts">
import { defineAsyncComponent, ref, watch } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const liveBoardVisible = ref(false)

watch(
  () => store.state.race.status,
  (status) => {
    if (status === 'idle') {
      liveBoardVisible.value = false
    }
    if (status === 'running') {
      liveBoardVisible.value = true
    }
    if (status === 'finished') {
      liveBoardVisible.value = false
    }
  },
  { immediate: true },
)

const HorseListPanel = defineAsyncComponent(
  () => import('../components/sections/HorseListPanel.vue'),
)
const ControlsPanel = defineAsyncComponent(
  () => import('../components/sections/Controls.vue'),
)
const ProgramResultsPanel = defineAsyncComponent(
  () => import('../components/sections/ProgramResultsPanel.vue'),
)
const LiveBoardPanel = defineAsyncComponent(
  () => import('../components/sections/LiveBoardPanel.vue'),
)
const RaceTrack = defineAsyncComponent(
  () => import('../components/sections/RaceTrack.vue'),
)
</script>

<template>
  <main class="game-view">
    <header class="game-view__header">
      <h1 class="game-view__title">Horse Racing Game</h1>
      <div class="game-view__header-actions">
        <ControlsPanel class="game-view__controls" />
        <button
          class="game-view__toggle"
          type="button"
          :disabled="store.state.race.status === 'idle'"
          @click="liveBoardVisible = !liveBoardVisible"
        >
          <span v-if="liveBoardVisible">Hide Live Results</span>
          <span v-else>Show Live Results</span>
        </button>
      </div>
    </header>

    <section class="game-view__content">
      <aside class="game-view__column game-view__column--left">
        <HorseListPanel />
      </aside>

      <section class="game-view__column game-view__column--center">
        <RaceTrack class="game-view__track" />
      </section>

      <aside class="game-view__column game-view__column--right">
        <LiveBoardPanel v-show="liveBoardVisible" />
        <ProgramResultsPanel />
      </aside>
    </section>
  </main>
</template>

<style scoped>
.game-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  gap: 0.6rem;
  padding: 0.3rem 1rem 1.3rem;
  background: radial-gradient(circle at top center, #eef2ff 0%, #e2e8f0 40%, #d9e2ec 100%);
  overflow: hidden;
}

.game-view__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
  background: rgba(249, 250, 252, 0.94);
  border-radius: 0.75rem;
  padding: 0.4rem 0.75rem;
  margin: 0.1rem 0;
  box-shadow:
    0 16px 26px rgba(15, 23, 42, 0.09),
    0 2px 8px rgba(15, 23, 42, 0.05);
}

.game-view__title {
  font-size: clamp(1.1rem, 1.4vw, 1.35rem);
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  letter-spacing: -0.01em;
}

.game-view__header-actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: nowrap;
}

.game-view__content {
  display: grid;
  grid-template-columns: 1fr 2.4fr 1.1fr;
  gap: 1rem;
  flex: 1;
  min-height: 0;
  height: 100%;
}

.game-view__column {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  min-height: 0;
  height: 100%;
}

.game-view__column--left {
  overflow: auto;
  padding-right: 0.2rem;
}

.game-view__controls {
  display: flex;
}

.game-view__toggle {
  appearance: none;
  border: 1px solid rgba(148, 163, 184, 0.24);
  background: rgba(255, 255, 255, 0.95);
  color: #312e81;
  border-radius: 0.55rem;
  padding: 0.28rem 0.6rem;
  font-weight: 600;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background 0.2s ease, box-shadow 0.2s ease;
  min-width: 7.5rem;
}

.game-view__toggle:hover:enabled {
  background: rgba(79, 70, 229, 0.08);
  box-shadow: 0 6px 12px rgba(79, 70, 229, 0.12);
}

.game-view__toggle:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.game-view__track {
  flex: 1;
  min-height: 0;
}

@media (max-width: 1024px) {
  .game-view__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.45rem 0.3rem;
  }

  .game-view__header-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .game-view__content {
    grid-template-columns: 1fr;
  }
}
</style>

