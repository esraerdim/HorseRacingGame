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
      liveBoardVisible.value = true
    }
  },
  { immediate: true },
)

const HorseListPanel = defineAsyncComponent(
  () => import('../components/panels/HorseListPanel.vue'),
)
const ControlsPanel = defineAsyncComponent(
  () => import('../components/controls/Controls.vue'),
)
const ProgramResultsPanel = defineAsyncComponent(
  () => import('../components/panels/ProgramResultsPanel.vue'),
)
const LiveBoardPanel = defineAsyncComponent(
  () => import('../components/panels/LiveBoardPanel.vue'),
)
const RaceTrack = defineAsyncComponent(
  () => import('../components/race/RaceTrack.vue'),
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
        <ControlsPanel />
        <RaceTrack class="game-view__track" />
      </section>

      <aside class="game-view__column game-view__column--right">
        <button
          class="game-view__toggle"
          type="button"
          :disabled="store.state.race.status === 'idle'"
          @click="liveBoardVisible = !liveBoardVisible"
        >
          <span v-if="liveBoardVisible">Hide Live Results</span>
          <span v-else>Show Live Results</span>
        </button>
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
  gap: 1.5rem;
  padding: 2rem;
  background: linear-gradient(135deg, #f9fafb 0%, #edf2fb 100%);
  overflow: hidden;
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
  min-height: 0;
  height: 100%;
}

.game-view__column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 0;
  height: 100%;
}

.game-view__column--left,
.game-view__column--right {
  overflow: auto;
  padding-right: 0.2rem;
}

.game-view__toggle {
  appearance: none;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: rgba(248, 250, 252, 0.9);
  color: #1f2937;
  border-radius: 0.75rem;
  padding: 0.6rem 0.8rem;
  font-weight: 600;
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: background 0.2s ease, box-shadow 0.2s ease;
}

.game-view__toggle:hover:enabled {
  background: rgba(79, 70, 229, 0.08);
  box-shadow: 0 8px 16px rgba(79, 70, 229, 0.08);
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
  .game-view__content {
    grid-template-columns: 1fr;
  }
}
</style>

