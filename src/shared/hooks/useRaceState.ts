import { computed } from 'vue'
import { useStore } from 'vuex'
import type { Horse, RaceRound, RaceRoundResult } from '@/types'
import type { RootState } from '@/store'

export const useRaceState = () => {
  const store = useStore<RootState>()

  const status = computed(() => store.state.race.status)
  const schedule = computed<RaceRound[]>(() => store.state.race.schedule ?? [])
  const currentRoundIndex = computed(() => store.state.race.currentRoundIndex)
  const results = computed<RaceRoundResult[]>(() => store.state.race.results ?? [])
  const previewResult = computed(() => store.state.race.currentRoundPreview)
  const roundSegments = computed<Record<number, number[]>>(
    () => store.state.race.currentRoundSegments ?? {},
  )
  const roundStartedAt = computed(() => store.state.race.roundStartedAt)
  const roundDuration = computed(() => store.state.race.roundDurationMs)
  const roundRemaining = computed(() => store.state.race.roundRemainingMs)
  const roundCompleted = computed(() => store.state.race.roundCompletedMs)

  const horseLookup = computed(() => {
    const map = new Map<number, Horse>()
    store.state.horses.pool.forEach((horse: Horse) => map.set(horse.id, horse))
    return map
  })

  return {
    store,
    status,
    schedule,
    currentRoundIndex,
    results,
    previewResult,
    roundSegments,
    roundStartedAt,
    roundDuration,
    roundRemaining,
    roundCompleted,
    horseLookup,
  }
}


