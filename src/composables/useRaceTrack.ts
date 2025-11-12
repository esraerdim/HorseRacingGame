import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { RaceRound, RaceRoundResult } from '@/types'
type PreviewEntry = RaceRoundResult['entries'][number]
type TrackRunner = {
  id: number
  laneIndex: number
  name: string
  trackProgress: number
  finished: boolean
  timeLabel: string
  color: string
}
import horseRunningAudio from '@/assets/horse-running.mp3'
import { useRaceState } from './useRaceState'

const computeSegmentProgress = (
  segments: number[] | undefined,
  elapsed: number,
  total: number,
) => {
  if (!segments || segments.length === 0) {
    return Math.min(1, total === 0 ? 0 : elapsed / total)
  }
  const timeline = segments as number[]
  const finalTime = timeline[timeline.length - 1] ?? total
  if (elapsed >= finalTime) {
    return 1
  }
  let previousTime = 0
  let previousProgress = 0
  const perSegmentProgress = 1 / timeline.length
  for (let i = 0; i < timeline.length; i += 1) {
    const segmentEnd = timeline[i] ?? total
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

export const useRaceTrack = () => {
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

  const activeRound = computed<RaceRound | null>(() => {
    const rounds = schedule.value
    if (!rounds.length) {
      return null
    }
    const direct = rounds[currentRoundIndex.value]
    if (direct) {
      return direct
    }
    return rounds[rounds.length - 1] ?? null
  })

  const latestResult = computed<RaceRoundResult | null>(() => {
    const entries = results.value
    if (!entries.length) {
      return null
    }
    return entries[entries.length - 1] ?? null
  })

  const now = ref(Date.now())
  let rafId: number | null = null
  let raceAudio: HTMLAudioElement | null = null

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

  const playRaceAudio = () => {
    if (!raceAudio) return
    raceAudio.loop = true
    raceAudio.volume = 0.55
    raceAudio.play().catch(() => {})
  }

  const pauseRaceAudio = (resetTime = true) => {
    if (!raceAudio) return
    raceAudio.pause()
    if (resetTime) {
      raceAudio.currentTime = 0
    }
  }

  watch(status, (value) => {
    if (value === 'running') {
      if (rafId === null) {
        tick()
      }
      playRaceAudio()
    } else {
      stopTicker()
      pauseRaceAudio(value !== 'paused')
    }
  })

  onMounted(() => {
    raceAudio = new Audio(horseRunningAudio)
    if (status.value === 'running') {
      tick()
      playRaceAudio()
    }
  })

  onBeforeUnmount(() => {
    stopTicker()
    pauseRaceAudio()
    raceAudio = null
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

  const runners = computed<TrackRunner[]>(() => {
    const round = activeRound.value
    if (!round) return []

    if (status.value === 'finished' && latestResult.value?.roundNumber === round.roundNumber) {
      const entryMap = new Map<number, PreviewEntry>()
      latestResult.value.entries.forEach((entry: PreviewEntry) =>
        entryMap.set(entry.horseId, entry),
      )
      return round.horseIds.map((horseId: number, laneIndex: number) => {
        const entry = entryMap.get(horseId)
        const color = horseLookup.value.get(horseId)?.color ?? '#4f46e5'
        const name = horseLookup.value.get(horseId)?.name ?? `Horse ${horseId}`
        if (!entry) {
          return {
            id: horseId,
            laneIndex,
            name,
            trackProgress: 1,
            finished: true,
            timeLabel: '—',
            color,
          }
        }
        return {
          id: entry.horseId,
          laneIndex,
          name,
          trackProgress: 1,
          finished: true,
          timeLabel: `${(entry.elapsedMs / 1000).toFixed(2)} s`,
          color,
        }
      })
    }

    const preview = previewResult.value
    if (!preview) {
      return round.horseIds.map((horseId: number, index: number) => ({
        id: horseId,
        laneIndex: index,
        name: horseLookup.value.get(horseId)?.name ?? `Horse ${horseId}`,
        trackProgress: 0,
        finished: false,
        timeLabel: 'Ready',
        color: horseLookup.value.get(horseId)?.color ?? '#4f46e5',
      }))
    }

    const elapsed = elapsedMs.value
    const segments = roundSegments.value
    const entryMap = new Map<number, PreviewEntry>()
    preview.entries.forEach((entry: PreviewEntry) => entryMap.set(entry.horseId, entry))

    return round.horseIds.map((horseId: number, laneIndex: number) => {
      const entry = entryMap.get(horseId)
      const color = horseLookup.value.get(horseId)?.color ?? '#4f46e5'
      const name = horseLookup.value.get(horseId)?.name ?? `Horse ${horseId}`
      if (!entry) {
        return {
          id: horseId,
          laneIndex,
          name,
          trackProgress: 0,
          finished: false,
          timeLabel: '—',
          color,
        }
      }
      const totalTime = entry.elapsedMs
      const progressFraction = computeSegmentProgress(
        segments[horseId],
        elapsed,
        totalTime,
      )
      const finished = elapsed >= totalTime
      const distanceCovered = Math.round(progressFraction * round.distance)
      return {
        id: horseId,
        laneIndex,
        name,
        trackProgress: Math.min(1, Math.max(0, progressFraction)),
        finished,
        timeLabel: finished
          ? `${(totalTime / 1000).toFixed(2)} s`
          : `${distanceCovered} m`,
        color,
      }
    })
  })

  const isPaused = computed(() => status.value === 'paused')
  const showAnimatedHorse = computed(() => status.value === 'running')

  const statusLabel = computed(() => {
    if (status.value === 'running') return 'Live'
    if (status.value === 'paused') return 'Paused'
    if (status.value === 'awaiting') return 'Awaiting'
    if (status.value === 'finished') return 'Finished'
    return 'Ready'
  })

  const statusTone = computed(() => {
    if (status.value === 'running') return 'accent'
    if (status.value === 'paused') return 'warning'
    if (status.value === 'awaiting') return 'info'
    if (status.value === 'finished') return 'success'
    return 'neutral'
  })

  return {
    status,
    activeRound,
    latestResult,
    runners,
    showAnimatedHorse,
    isPaused,
    statusLabel,
    statusTone,
    formatLap,
  }
}


