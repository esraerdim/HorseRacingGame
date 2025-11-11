<template>
  <section class="horse-list-panel">
    <header class="horse-list-panel__header">
      <h2>Horse Roster</h2>
      <span class="horse-list-panel__meta">
        {{ horses.length }} / {{ totalHorses }} horses
      </span>
    </header>

    <div v-if="isGenerating" class="horse-list-panel__state">
      <span class="horse-list-panel__spinner" aria-hidden="true" />
      <span>Generating horse pool…</span>
    </div>
    <ul v-else class="horse-list-panel__grid">
      <li
        v-for="horse in orderedHorses"
        :key="horse.id"
        class="horse-card"
        :class="{ 'horse-card--highlight': highlightedHorseIds.has(horse.id) }"
      >
        <span
          class="horse-card__swatch"
          :style="{ backgroundColor: horse.color }"
          aria-hidden="true"
        />
        <div class="horse-card__meta">
          <span class="horse-card__name">{{ horse.name }}</span>
          <span class="horse-card__stats">Condition: {{ horse.condition }}</span>
        </div>
      </li>
    </ul>

    <p v-if="!horses.length && !isGenerating" class="horse-list-panel__empty">
      No horses have been generated yet. Click Generate to build the roster.
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import type { Horse } from '../../types'
import type { RootState } from '../../store'

const store = useStore<RootState>()

const horses = computed(() => store.getters['horses/horsePool'] as Horse[])
const totalHorses = computed(() => store.getters['horses/horseCount'] as number)
const isGenerating = computed(
  () => store.getters['horses/isGenerating'] as boolean,
)

const highlightedHorseIds = computed(() => {
  const schedule = store.state.race.schedule
  if (!schedule.length) {
    return new Set<number>()
  }
  const currentRoundIndex = store.state.race.currentRoundIndex
  const activeRound = schedule[currentRoundIndex]
  return new Set<number>(activeRound?.horseIds ?? [])
})

const orderedHorses = computed(() => {
  const highlights = highlightedHorseIds.value
  if (!highlights.size) {
    return horses.value
  }
  const selected: Horse[] = []
  const rest: Horse[] = []

  horses.value.forEach((horse) => {
    if (highlights.has(horse.id)) {
      selected.push(horse)
    } else {
      rest.push(horse)
    }
  })

  return [...selected, ...rest]
})
</script>

<style scoped>
.horse-list-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.92);
  box-shadow:
    0 12px 24px rgba(15, 23, 42, 0.08),
    0 2px 6px rgba(15, 23, 42, 0.05);
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.horse-list-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.horse-list-panel__header h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.horse-list-panel__meta {
  font-size: 0.875rem;
  color: #6b7280;
}

.horse-list-panel__state {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  color: #374151;
  flex: 1;
  justify-content: center;
}

.horse-list-panel__spinner {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  border: 2px solid #a5b4fc;
  border-top-color: transparent;
  animation: spin 0.9s linear infinite;
}

.horse-list-panel__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.75rem;
  list-style: none;
  margin: 0;
  padding: 0 0.25rem 0 0;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.horse-card {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: rgba(248, 250, 252, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.horse-card--highlight {
  border-color: rgba(79, 70, 229, 0.5);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25);
}

.horse-card__swatch {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.12);
}

.horse-card__meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.horse-card__name {
  font-weight: 600;
  color: #1f2937;
}

.horse-card__stats {
  font-size: 0.8rem;
  color: #6b7280;
}

.horse-list-panel__empty {
  margin: auto 0 0;
  font-size: 0.9rem;
  color: #6b7280;
  text-align: center;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

