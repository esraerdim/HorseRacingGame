<template>
  <section class="program-panel">
    <header class="program-panel__header">
      <h2>Race Program</h2>
      <span class="program-panel__meta">
        {{ programRounds.length }} rounds scheduled
      </span>
    </header>

    <p v-if="!programRounds.length" class="program-panel__empty">
      Program is empty. Generate a roster to build the race schedule.
    </p>

    <ul v-else class="program-panel__rounds">
      <li
        v-for="round in programRounds"
        :key="round.roundNumber"
        class="program-panel__round"
        :class="{ 'program-panel__round--active': isActiveRound(round.roundNumber) }"
      >
        <header class="program-panel__round-header">
          <span class="program-panel__round-index">{{ round.roundNumber }}</span>
          <div class="program-panel__round-meta">
            <h3>{{ formatLap(round.roundNumber) }}</h3>
            <span>{{ round.distance }} m</span>
          </div>
          <span class="program-panel__round-count">
            {{ round.horseNames.length }} horses
          </span>
        </header>
        <ul class="program-panel__horse-list">
          <li
            v-for="horseName in round.horseNames"
            :key="horseName"
            class="program-panel__horse"
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

type ProgramRound = RaceRound & { horseNames: string[] }

const store = useStore<RootState>()

const formatLap = (roundNumber: number) => {
  const remainder = roundNumber % 100
  if (remainder >= 11 && remainder <= 13) {
    return `${roundNumber}th Lap`
  }
  switch (roundNumber % 10) {
    case 1:
      return `${roundNumber}st Lap`
    case 2:
      return `${roundNumber}nd Lap`
    case 3:
      return `${roundNumber}rd Lap`
    default:
      return `${roundNumber}th Lap`
  }
}

const horseLookup = computed(() => {
  const map = new Map<number, Horse>()
  store.state.horses.pool.forEach((horse) => map.set(horse.id, horse))
  return map
})

const currentRoundIndex = computed(() => store.state.race.currentRoundIndex)

const programRounds = computed<ProgramRound[]>(() =>
  store.state.race.schedule.map((round) => ({
    ...round,
    horseNames: round.horseIds.map(
      (horseId) => horseLookup.value.get(horseId)?.name ?? `Horse ${horseId}`,
    ),
  })),
)

const isActiveRound = (roundNumber: number) =>
  roundNumber === currentRoundIndex.value + 1
</script>

<style scoped>
.program-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
  min-height: 0;
}

.program-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.program-panel__header h2 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: #111827;
}

.program-panel__meta {
  font-size: 0.85rem;
  color: #6b7280;
}

.program-panel__empty {
  margin: auto;
  color: #6b7280;
  font-size: 0.9rem;
}

.program-panel__rounds {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow-y: auto;
}

.program-panel__round {
  background: rgba(248, 250, 252, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 0.85rem;
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.program-panel__round--active {
  border-color: rgba(79, 70, 229, 0.6);
  box-shadow: 0 12px 18px rgba(79, 70, 229, 0.12);
}

.program-panel__round-header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.program-panel__round-index {
  width: 2.1rem;
  height: 2.1rem;
  border-radius: 0.7rem;
  background: #4f46e5;
  display: grid;
  place-items: center;
  color: #f9fafb;
  font-weight: 700;
  font-size: 0.95rem;
}

.program-panel__round-meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.program-panel__round-meta h3 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1f2937;
}

.program-panel__round-meta span {
  font-size: 0.8rem;
  color: #64748b;
}

.program-panel__round-count {
  margin-left: auto;
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 600;
}

.program-panel__horse-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.45rem;
  font-size: 0.85rem;
  color: #1f2937;
}

.program-panel__horse {
  padding: 0.45rem 0.55rem;
  border-radius: 0.5rem;
  background: #ffffff;
  border: 1px solid rgba(148, 163, 184, 0.2);
}
</style>

