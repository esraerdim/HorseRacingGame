<template>
  <section class="program-panel">
    <header class="program-panel__header">
      <h2>Race Program</h2>
      <span class="program-panel__meta">
        {{ rounds.length }} rounds scheduled
      </span>
    </header>

    <p v-if="!rounds.length" class="program-panel__empty">
      Program is empty. Generate a roster to build the race schedule.
    </p>

    <ul v-else class="program-panel__list">
      <li
        v-for="round in rounds"
        :key="round.roundNumber"
        class="program-round"
      >
        <div class="program-round__header">
          <span class="program-round__title">Round {{ round.roundNumber }}</span>
          <span class="program-round__distance">
            {{ round.distance }} m
          </span>
        </div>
        <ul class="program-round__horses">
          <li
            v-for="horseName in round.horseNames"
            :key="horseName"
            class="program-round__horse"
          >
            {{ horseName }}
          </li>
        </ul>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import type { Horse, RaceRound } from '../../types'
import type { RootState } from '../../store'

interface EnrichedRound extends RaceRound {
  horseNames: string[]
}

const store = useStore<RootState>()

const horseLookup = computed(() => {
  const map = new Map<number, Horse>()
  store.state.horses.pool.forEach((horse) => {
    map.set(horse.id, horse)
  })
  return map
})

const rounds = computed<EnrichedRound[]>(() =>
  store.state.race.schedule.map((round) => ({
    ...round,
    horseNames: round.horseIds.map(
      (horseId) => horseLookup.value.get(horseId)?.name ?? `Horse ${horseId}`,
    ),
  })),
)
</script>

<style scoped>
.program-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.92);
  box-shadow:
    0 12px 24px rgba(15, 23, 42, 0.08),
    0 2px 6px rgba(15, 23, 42, 0.05);
  max-height: 100%;
  overflow: auto;
}

.program-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.program-panel__header h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.program-panel__meta {
  font-size: 0.875rem;
  color: #6b7280;
}

.program-panel__empty {
  margin: 0;
  font-size: 0.9rem;
  color: #6b7280;
  text-align: center;
}

.program-panel__list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.program-round {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: rgba(248, 250, 252, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.program-round__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #1f2937;
}

.program-round__title {
  font-size: 0.95rem;
}

.program-round__distance {
  font-size: 0.85rem;
  color: #4b5563;
}

.program-round__horses {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.program-round__horse {
  padding: 0.4rem 0.5rem;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.2);
  font-size: 0.8rem;
  color: #374151;
}
</style>

