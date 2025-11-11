<template>
  <section class="live-board">
    <header class="live-board__header">
      <div>
        <h2>{{ title }}</h2>
        <span class="live-board__subtitle">{{ subtitle }}</span>
      </div>
      <span class="live-board__badge" :class="`live-board__badge--${statusClass}`">
        {{ statusLabel }}
      </span>
    </header>

    <div v-if="!activeRound" class="live-board__empty">
      <p>Generate a race to see the live board.</p>
    </div>
    <div v-else class="live-board__content">
      <div class="live-board__meta">
        <span>{{ formatLap(activeRound.roundNumber) }}</span>
        <span>{{ activeRound.distance }} m</span>
      </div>
      <div class="live-board__progress" :data-status="statusLabel.toLowerCase()">
        <div class="live-board__progress-bar" :style="{ width: `${progress}%` }" />
      </div>
      <TransitionGroup tag="ul" class="live-board__list" name="live-board">
        <li
          v-for="horse in liveEntries"
          :key="horse.id"
          class="live-board__item"
        >
          <span class="live-board__position">
            {{ horse.positionLabel }}
          </span>
          <span class="live-board__name">{{ horse.name }}</span>
          <span class="live-board__time" v-if="horse.timeLabel">{{ horse.timeLabel }}</span>
        </li>
      </TransitionGroup>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'
import type { Horse, RaceRound, RaceRoundResult } from '../../types'
import type { RootState } from '../../store'

type LiveEntry = {
  id: number
  name: string
  positionLabel: string
  timeLabel?: string
}

const store = useStore<RootState>()

const status = computed(() => store.state.race.status)
const schedule = computed(() => store.state.race.schedule)
const currentRoundIndex = computed(() => store.state.race.currentRoundIndex)
const results = computed(() => store.state.race.results)
const previewResult = computed(() => store.state.race.currentRoundPreview)
const roundSegments = computed(() => store.state.race.currentRoundSegments)
const roundStartedAt = computed(() => store.state.race.roundStartedAt)
const roundDuration = computed(() => store.state.race.roundDurationMs)
const roundRemaining = computed(() => store.state.race.roundRemainingMs)
const roundCompleted = computed(() => store.state.race.roundCompletedMs)

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

const horseLookup = computed(() => {
  const map = new Map<number, Horse>()
  store.state.horses.pool.forEach((horse) => map.set(horse.id, horse))
  return map
})

const activeRound = computed<RaceRound | null>(() => {
  if (!schedule.value.length) {
    return null
  }
  if (currentRoundIndex.value < schedule.value.length) {
    return schedule.value[currentRoundIndex.value]
  }
  return schedule.value[schedule.value.length - 1]
})

const latestResult = computed<RaceRoundResult | null>(() => {
  if (!results.value.length) {
    return null
  }
  return results.value[results.value.length - 1]
})

const isLive = computed(() => status.value === 'running')
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
  if (!segments || !segments.length) {
    return Math.min(1, elapsed / (roundDuration.value || 1))
  }
  const totalTime = segments[segments.length - 1]
  if (elapsed >= totalTime) {
    return 1
  }
  let previousTime = 0
  let previousProgress = 0
  const perSegmentProgress = 1 / segments.length
  for (let i = 0; i < segments.length; i += 1) {
    const segmentEnd = segments[i]
    if (elapsed < segmentEnd) {
      const segmentElapsed = elapsed - previousTime
      const segmentDuration = segmentEnd - previousTime || 1
      return (
        previousProgress + perSegmentProgress * Math.max(0, segmentElapsed / segmentDuration)
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
    return latestResult.value.entries.map((entry) => ({
      id: entry.horseId,
      name:
        horseLookup.value.get(entry.horseId)?.name ?? `Horse ${entry.horseId}`,
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

  const enriched = preview.entries.map((entry) => {
    const totalTime = entry.elapsedMs
    const progressFraction = computeSegmentProgress(segments[entry.horseId], elapsed)
    const currentTime = Math.min(elapsed, totalTime)
    const finished = elapsed >= totalTime
    return {
      id: entry.horseId,
      name: horseLookup.value.get(entry.horseId)?.name ?? `Horse ${entry.horseId}`,
      progressFraction,
      finishTime: totalTime,
      finished,
      currentTime,
      finalPosition: entry.position,
    }
  })

  enriched.sort((a, b) => {
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

  return enriched.map((entry, index) => ({
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

const statusClass = computed(() => statusLabel.value.toLowerCase())

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
</script>

<style scoped>
.live-board {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  padding: 0.9rem 1rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.92);
  box-shadow:
    0 12px 24px rgba(15, 23, 42, 0.08),
    0 2px 6px rgba(15, 23, 42, 0.05);
  flex: none;
}

.live-board__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
}

.live-board__header h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.live-board__subtitle {
  display: block;
  font-size: 0.78rem;
  color: #6b7280;
  margin-top: 0.15rem;
}

.live-board__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 4rem;
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.live-board__badge--live {
  background: rgba(244, 63, 94, 0.18);
  color: #be123c;
}

.live-board__badge--completed {
  background: rgba(34, 197, 94, 0.18);
  color: #166534;
}

.live-board__badge--paused {
  background: rgba(250, 204, 21, 0.18);
  color: #b45309;
}

.live-board__badge--upcoming {
  background: rgba(59, 130, 246, 0.18);
  color: #1d4ed8;
}

.live-board__empty {
  display: grid;
  place-items: center;
  padding: 1.5rem 1rem;
  color: #6b7280;
  font-size: 0.9rem;
}

.live-board__content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.live-board__meta {
  display: flex;
  justify-content: space-between;
  color: #4b5563;
  font-weight: 600;
  font-size: 0.8rem;
}

.live-board__progress {
  position: relative;
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.25);
  overflow: hidden;
}

.live-board__progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #4f46e5 0%, #22d3ee 100%);
  transition: width 0.1s linear;
}

.live-board__progress[data-status='completed'] .live-board__progress-bar {
  background: linear-gradient(90deg, #22c55e 0%, #86efac 100%);
}

.live-board__progress[data-status='upcoming'] .live-board__progress-bar {
  background: linear-gradient(90deg, #94a3b8 0%, #cbd5f5 100%);
}

.live-board__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  max-height: 150px;
  overflow-y: auto;
}

.live-board__item {
  display: grid;
  grid-template-columns: 2.5rem 1fr auto;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 0.6rem;
  border-radius: 0.6rem;
  background: rgba(248, 250, 252, 0.96);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.live-board-move {
  transition: transform 0.35s ease, opacity 0.35s ease;
}

.live-board-enter-active,
.live-board-leave-active {
  transition: transform 0.35s ease, opacity 0.35s ease;
}

.live-board-enter-from,
.live-board-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

.live-board-leave-active {
  position: absolute;
}

.live-board__position {
  font-weight: 700;
  color: #1f2937;
  font-size: 0.85rem;
}

.live-board__name {
  font-weight: 500;
  color: #1f2937;
  font-size: 0.85rem;
}

.live-board__time {
  font-size: 0.75rem;
  color: #6b7280;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 1024px) {
  .live-board__item {
    grid-template-columns: 2rem 1fr;
  }

  .live-board__time {
    justify-self: flex-end;
  }
}
</style>
