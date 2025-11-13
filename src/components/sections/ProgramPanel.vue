<template>
  <section class="program-panel">
    <header class="program-panel__header">
      <h2>Race Program</h2>
        <span class="program-panel__meta">
          {{ programRounds.length }} rounds scheduled
        </span>
    </header>

    <AppEmptyState v-if="!programRounds.length">
      Program is empty. Generate a roster to build the race schedule.
    </AppEmptyState>

    <ul v-else ref="roundsList" class="program-panel__rounds">
      <ProgramRoundCard
        v-for="round in programRounds"
        :key="round.roundNumber"
        :data-round="round.roundNumber"
        :index="round.roundNumber"
        :title="formatLap(round.roundNumber)"
        :distance="round.distance"
        :horses="round.horseNames"
        :active="isActiveRound(round.roundNumber)"
      />
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useStore } from 'vuex'
import type { Horse, RaceRound } from '@/types'
import type { RootState } from '@/store'
import { AppEmptyState } from '@/components/base'
import { ProgramRoundCard } from '@/components/features'

type ProgramRound = RaceRound & { horseNames: string[] }

const store = useStore<RootState>()
const roundsList = ref<HTMLUListElement | null>(null)

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

watch(currentRoundIndex, async (idx) => {
  await nextTick()
  const targetRound = roundsList.value?.querySelector<HTMLElement>(
    `[data-round="${idx + 1}"]`,
  )
  targetRound?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
})
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
  gap: 0.5rem;
}

.program-panel__header h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #0f172a;
}

.program-panel__meta {
  font-size: 0.9rem;
  color: #64748b;
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
</style>

