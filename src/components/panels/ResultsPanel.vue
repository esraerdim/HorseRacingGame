<template>
  <section class="results-panel">
    <header class="results-panel__header">
      <h2>Race Results</h2>
      <span class="results-panel__meta">
        {{ results.length }} rounds completed
      </span>
    </header>

    <p v-if="!results.length" class="results-panel__empty">
      No results yet. Start the race to populate this view.
    </p>

    <ul v-else class="results-panel__rounds">
      <li
        v-for="round in results"
        :key="round.roundNumber"
        class="results-panel__round"
      >
        <header class="results-panel__round-header">
          <div>
            <h3>Round {{ round.roundNumber }}</h3>
            <span>{{ round.distance }} m</span>
          </div>
          <span class="results-panel__round-duration">
            Top time: {{ round.topTime }} s
          </span>
        </header>
        <table class="results-panel__table">
          <thead>
            <tr>
              <th scope="col">Pos</th>
              <th scope="col">Name</th>
              <th scope="col">Time (s)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in round.entries" :key="entry.horseId">
              <td>{{ entry.position }}</td>
              <td>{{ entry.horseName }}</td>
              <td>{{ entry.timeLabel }}</td>
            </tr>
          </tbody>
        </table>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import type { Horse, RaceRoundResult } from '../../types'
import type { RootState } from '../../store'
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

.results-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.results-panel__header h2 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
}

.results-panel__meta {
  font-size: 0.85rem;
  color: #6b7280;
}

.results-panel__empty {
  margin: auto;
  color: #6b7280;
  font-size: 0.9rem;
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

.results-panel__round {
  background: rgba(248, 250, 252, 0.95);
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 0.85rem;
  padding: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.results-panel__round-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}

.results-panel__round-header h3 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
}

.results-panel__round-header span {
  display: block;
  font-size: 0.8rem;
  color: #64748b;
}

.results-panel__round-duration {
  font-size: 0.78rem;
  color: #4b5563;
  font-weight: 600;
}

.results-panel__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.results-panel__table th {
  text-align: left;
  color: #475569;
  font-weight: 600;
  padding-bottom: 0.35rem;
}

.results-panel__table td {
  padding: 0.35rem 0;
  border-top: 1px solid rgba(148, 163, 184, 0.25);
  color: #111827;
}
</style>

