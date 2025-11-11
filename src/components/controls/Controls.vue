<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import type { RootState } from '../../store'

const store = useStore<RootState>()

const isGenerating = computed(
  () => store.getters['horses/isGenerating'] as boolean,
)

const raceStatus = computed(() => store.state.race.status)
const isPaused = computed(() => store.state.race.isPaused)
const hasSchedule = computed(() => store.state.race.schedule.length > 0)

const startPauseLabel = computed(() => {
  if (raceStatus.value === 'running') return 'Pause'
  if (raceStatus.value === 'paused') return 'Resume'
  if (raceStatus.value === 'awaiting') return 'Next Lap'
  if (raceStatus.value === 'finished') return 'Race Finished'
  return 'Start'
})

const handleGenerate = async () => {
  await store.dispatch('generateRaceProgram')
}

const handleStartPause = () => {
  if (!hasSchedule.value) return
  if (raceStatus.value === 'running') {
    store.dispatch('race/pauseRace')
  } else if (raceStatus.value === 'paused') {
    store.dispatch('race/resumeRace')
  } else if (raceStatus.value === 'awaiting') {
    store.dispatch('race/startNextRound')
  } else {
    store.dispatch('race/startRace')
  }
}

const handleReset = () => {
  store.dispatch('race/resetRace')
}
</script>

<template>
  <section class="controls">
    <header class="controls__header">
      <h2>Race Controls</h2>
    </header>

    <div class="controls__actions">
      <button
        type="button"
        class="controls__button controls__button--primary"
        :disabled="isGenerating"
        @click="handleGenerate"
      >
        <span v-if="isGenerating">Generating…</span>
        <span v-else>Generate</span>
      </button>
      <button
        type="button"
        class="controls__button"
        :disabled="
          !hasSchedule || raceStatus === 'finished' || (raceStatus === 'ready' && !hasSchedule)
        "
        @click="handleStartPause"
      >
        {{ startPauseLabel }}
      </button>
      <button
        type="button"
        class="controls__button controls__button--secondary"
        :disabled="raceStatus === 'idle' && !hasSchedule"
        @click="handleReset"
      >
        Reset
      </button>
    </div>
  </section>
</template>

<style scoped>
.controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.92);
  box-shadow:
    0 12px 24px rgba(15, 23, 42, 0.08),
    0 2px 6px rgba(15, 23, 42, 0.05);
}

.controls__header h2 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.controls__actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
}

.controls__button {
  appearance: none;
  border: 1px solid rgba(148, 163, 184, 0.4);
  background: rgba(248, 250, 252, 0.9);
  color: #1f2937;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease,
    background-color 0.15s ease;
}

.controls__button:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(59, 130, 246, 0.1);
}

.controls__button:active {
  transform: translateY(0);
}

.controls__button--primary {
  background: #4f46e5;
  border-color: transparent;
  color: #f9fafb;
}

.controls__button--secondary {
  background: rgba(244, 63, 94, 0.08);
  border-color: rgba(244, 63, 94, 0.2);
  color: #be123c;
}

.controls__button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
  transform: none;
  box-shadow: none;
}
</style>

