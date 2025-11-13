import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { RaceRound, RaceRoundResult } from '@/types'
import { useRaceState } from '@/shared/hooks/useRaceState'

type LiveEntry = {
  id: number
  name: string
  positionLabel: string
  timeLabel?: string
}

type PreviewEntry = RaceRoundResult['entries'][number]
type EnrichedEntry = {
  id: number
  name: string
  progressFraction: number
  finishTime: number
  finished: boolean
}

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

export const useLiveBoard = () => {
  const {
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
  } = useRaceState()

  const now = ref(Date.now())
  let rafId: number | null = null

  const stopTicker = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  const tick = () => {
    now.value = Date.now()
    rafId = requestAnimationFrame(tick)
  }

  watch(status, (value) => {
    if (value === 'running') {
      if (rafId === null) {
        tick()
      }
    } else {
      stopTicker()
    }
  })

  onMounted(() => {
    if (status.value === 'running') {
      tick()
    }
  })

  onBeforeUnmount(() => {
    stopTicker()
  })

  const activeRound = computed<RaceRound | null>(() => {
    const rounds = schedule.value
    if (!rounds.length) {
      return null
    }
    const index = currentRoundIndex.value
    if (index >= 0 && index < rounds.length) {
      return rounds[index] ?? null
    }
    return rounds[rounds.length - 1] ?? null
  })

  const latestResult = computed<RaceRoundResult | null>(() => {
    const allResults = results.value
    if (!allResults.length) {
      return null
    }
    return allResults[allResults.length - 1] ?? null
  })

  const hasFinishedCurrentRound = computed(() => {
    if (!activeRound.value) return false
    return results.value.some(
      (result) => result.roundNumber === activeRound.value?.roundNumber,
    )
  })

  const elapsedMs = computed(() => {
    const duration = roundDuration.value
    if (!duration) return 0
    let completed = roundCompleted.value || 0
    if (status.value === 'running' && roundStartedAt.value) {
      completed = Math.min(duration, completed + (now.value - roundStartedAt.value))
    } else if (roundRemaining.value !== null) {
      completed = duration - roundRemaining.value
    }
    return Math.max(0, Math.min(completed, duration))
  })

  const progress = computed(() => {
    const duration = roundDuration.value
    if (!duration || !activeRound.value) {
      return status.value === 'finished' ? 100 : 0
    }
    if (status.value === 'finished') {
      return 100
    }
    return Math.max(0, Math.min(100, Math.round((elapsedMs.value / duration) * 100)))
  })

  const computeSegmentProgress = (segments: number[] | undefined, elapsed: number) => {
    if (!segments || segments.length === 0) {
      return Math.min(1, elapsed / (roundDuration.value || 1))
    }
    const totalTime = segments[segments.length - 1]
    if (totalTime === undefined || totalTime <= 0) {
      return Math.min(1, elapsed / (roundDuration.value || 1))
    }
    if (elapsed >= totalTime) {
      return 1
    }
    let previousTime = 0
    let previousProgress = 0
    const perSegmentProgress = 1 / segments.length
    for (let i = 0; i < segments.length; i += 1) {
      const segmentEnd = segments[i]!
      if (elapsed < segmentEnd) {
        const segmentElapsed = elapsed - previousTime
        const segmentDuration = segmentEnd - previousTime || 1
        return (
          previousProgress +
          perSegmentProgress * Math.max(0, segmentElapsed / segmentDuration)
        )
      }
      previousTime = segmentEnd
      previousProgress += perSegmentProgress
    }
    return 1
  }

  const liveEntries = computed<LiveEntry[]>(() => {
    const round = activeRound.value
    if (!round) return []

    if (
      hasFinishedCurrentRound.value &&
      latestResult.value?.roundNumber === round.roundNumber &&
      status.value === 'finished'
    ) {
      return latestResult.value.entries.map((entry: PreviewEntry) => ({
        id: entry.horseId,
        name: horseLookup.value.get(entry.horseId)?.name ?? `Horse ${entry.horseId}`,
        positionLabel: `#${entry.position}`,
        timeLabel: `${(entry.elapsedMs / 1000).toFixed(2)} s`,
      }))
    }

    const preview = previewResult.value
    if (!preview) {
      return round.horseIds.map((horseId, index) => ({
        id: horseId,
        name: horseLookup.value.get(horseId)?.name ?? `Horse ${horseId}`,
        positionLabel: `#${index + 1}`,
      }))
    }

    const elapsed = elapsedMs.value
    const segments = roundSegments.value

    const enriched: EnrichedEntry[] = preview.entries.map((entry: PreviewEntry) => {
      const totalTime = entry.elapsedMs
      const progressFraction = computeSegmentProgress(segments[entry.horseId], elapsed)
      const finished = elapsed >= totalTime
      return {
        id: entry.horseId,
        name: horseLookup.value.get(entry.horseId)?.name ?? `Horse ${entry.horseId}`,
        progressFraction,
        finishTime: totalTime,
        finished,
      }
    })

    enriched.sort((a: EnrichedEntry, b: EnrichedEntry) => {
      if (a.finished && b.finished) {
        return a.finishTime - b.finishTime
      }
      if (a.finished) return -1
      if (b.finished) return 1
      if (b.progressFraction !== a.progressFraction) {
        return b.progressFraction - a.progressFraction
      }
      return a.finishTime - b.finishTime
    })

    return enriched.map((entry: EnrichedEntry, index: number) => ({
      id: entry.id,
      name: entry.name,
      positionLabel: `#${index + 1}`,
      timeLabel: entry.finished
        ? `${(entry.finishTime / 1000).toFixed(2)} s`
        : `${Math.round(entry.progressFraction * (activeRound.value?.distance ?? 0))} m`,
    }))
  })

  const statusLabel = computed(() => {
    if (status.value === 'running') return 'Live'
    if (status.value === 'paused') return 'Paused'
    if (status.value === 'awaiting') return 'Awaiting'
    if (hasFinishedCurrentRound.value) return 'Completed'
    return 'Upcoming'
  })

  const badgeTone = computed(() => {
    if (status.value === 'running') return 'accent'
    if (status.value === 'paused') return 'warning'
    if (status.value === 'awaiting') return 'info'
    if (status.value === 'finished' || hasFinishedCurrentRound.value) return 'success'
    return 'neutral'
  })

  const progressTone = computed(() => {
    if (status.value === 'running') return 'accent'
    if (status.value === 'paused') return 'warning'
    if (status.value === 'awaiting') return 'muted'
    if (status.value === 'finished' || hasFinishedCurrentRound.value) return 'success'
    return 'info'
  })

  const title = computed(() => {
    if (status.value === 'running') return 'Live Leaderboard'
    if (status.value === 'paused') return 'Race Paused'
    if (status.value === 'awaiting') return 'Awaiting Next Lap'
    if (hasFinishedCurrentRound.value) return 'Latest Results'
    return 'Next Round Lineup'
  })

  const subtitle = computed(() => {
    if (!activeRound.value) {
      return 'Awaiting race schedule'
    }
    if (status.value === 'running') {
      return 'Round in progress'
    }
    if (status.value === 'paused') {
      return 'Round paused'
    }
    if (status.value === 'awaiting') {
      return 'Round completed – tap Next Lap to continue'
    }
    if (hasFinishedCurrentRound.value) {
      return 'Round completed'
    }
    return 'Round ready to start'
  })

  return {
    status,
    activeRound,
    latestResult,
    hasFinishedCurrentRound,
    elapsedMs,
    progress,
    liveEntries,
    statusLabel,
    badgeTone,
    progressTone,
    title,
    subtitle,
    formatLap,
  }
}


