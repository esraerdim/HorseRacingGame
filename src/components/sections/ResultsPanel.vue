<template>
  <AppPanel class="results-panel">
    <AppSectionHeader title="Race Results">
      <template #meta>
        <span class="results-panel__meta">
          {{ results.length }} rounds completed
        </span>
      </template>
    </AppSectionHeader>

    <AppEmptyState v-if="!results.length">
      No results yet. Start the race to populate this view.
    </AppEmptyState>

    <ul v-else class="results-panel__rounds">
      <ResultRoundCard
        v-for="round in results"
        :key="round.roundNumber"
        :title="`Round ${round.roundNumber}`"
        :distance="round.distance"
        :top-time="round.topTime"
        :entries="round.entries"
      />
    </ul>
  </AppPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import type { Horse, RaceRoundResult } from '@/types'
import type { RootState } from '@/store'
import { AppPanel, AppSectionHeader, AppEmptyState } from '@/components/primitives'
import { ResultRoundCard } from '@/components/compounds'
type EnrichedResult = RaceRoundResult & {
  distance: number
  entries: Array<
    RaceRoundResult['entries'][number] & {
      horseName: string
      timeLabel: string
    }
  >
  topTime: string
}

const store = useStore<RootState>()

const horseLookup = computed(() => {
  const map = new Map<number, Horse>()
  store.state.horses.pool.forEach((horse) => map.set(horse.id, horse))
  return map
})

const results = computed<EnrichedResult[]>(() => {
  const schedule = store.state.race.schedule
  return store.state.race.results.map((roundResult) => {
    const scheduleInfo = schedule.find(
      (round) => round.roundNumber === roundResult.roundNumber,
    )
    const distance = scheduleInfo?.distance ?? 0

    const entries = roundResult.entries.map((entry) => {
      const timeSeconds = entry.elapsedMs / 1000
      return {
        ...entry,
        horseName:
          horseLookup.value.get(entry.horseId)?.name ?? `Horse ${entry.horseId}`,
        timeLabel: timeSeconds.toFixed(2),
      }
    })

    const topEntry = entries.length > 0 ? entries[0] : undefined

    return {
      ...roundResult,
      distance,
      entries,
      topTime: topEntry?.timeLabel ?? '—',
    }
  })
})
</script>

<style scoped>
.results-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
  min-height: 0;
}

.results-panel__rounds {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow-y: auto;
}
</style>

