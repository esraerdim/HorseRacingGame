<template>
  <section class="race-track">
    <div class="race-track__status" v-if="!activeRound">
      <p>Generate a schedule and press Start to watch the horses run.</p>
    </div>
    <div v-else class="race-track__inner">
      <header class="race-track__header">
        <div>
          <h2>{{ formatLap(activeRound.roundNumber) }}</h2>
          <span>{{ activeRound.distance }} m</span>
        </div>
        <span class="race-track__badge" :class="`race-track__badge--${statusLabel.toLowerCase()}`">
          {{ statusLabel }}
        </span>
      </header>

      <div class="race-track__track" :style="{ '--lane-count': runners.length }">
        <div
          v-for="runner in runners"
          :key="runner.id"
          class="race-track__lane"
        >
          <span class="race-track__lane-number">{{ runner.laneIndex + 1 }}</span>
          <div class="race-track__lane-track">
            <span class="race-track__lane-label">{{ runner.name }}</span>
            <div
              class="race-track__horse-wrapper"
              :style="{ '--progress': runner.trackProgress }"
            >
              <div
                class="race-track__horse"
                :class="{
                  'race-track__horse--running': showAnimatedHorse && !runner.finished,
                  'race-track__horse--idle': !showAnimatedHorse || runner.finished,
                  'race-track__horse--paused': isPaused,
                  'race-track__horse--finished': runner.finished,
                }"
                :style="{ '--horse-color': runner.color }"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'
import type { RootState } from '../../store'
import type { Horse, RaceRound, RaceRoundResult } from '../../types'

const store = useStore<RootState>()

const status = computed(() => store.state.race.status)
const schedule = computed(() => store.state.race.schedule)
const currentRoundIndex = computed(() => store.state.race.currentRoundIndex)
const previewResult = computed(() => store.state.race.currentRoundPreview)
const roundSegments = computed(() => store.state.race.currentRoundSegments)
const roundStartedAt = computed(() => store.state.race.roundStartedAt)
const roundDuration = computed(() => store.state.race.roundDurationMs)
const roundRemaining = computed(() => store.state.race.roundRemainingMs)
const roundCompleted = computed(() => store.state.race.roundCompletedMs)
const results = computed(() => store.state.race.results)
const horseLookup = computed(() => {
  const map = new Map<number, Horse>()
  store.state.horses.pool.forEach((horse) => map.set(horse.id, horse))
  return map
})

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
    if (rafId === null) tick()
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

const computeSegmentProgress = (segments: number[] | undefined, elapsed: number, total: number) => {
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
        previousProgress + perSegmentProgress * Math.max(0, segmentElapsed / segmentDuration)
      )
    }
    previousTime = segmentEnd
    previousProgress += perSegmentProgress
  }
  return 1
}

const runners = computed(() => {
  const round = activeRound.value
  if (!round) return []

  if (status.value === 'finished' && latestResult.value?.roundNumber === round.roundNumber) {
    const entryMap = new Map<number, RaceRoundResult['entries'][number]>()
    latestResult.value.entries.forEach((entry) => entryMap.set(entry.horseId, entry))
    return round.horseIds.map((horseId, laneIndex) => {
      const entry = entryMap.get(horseId)
      if (!entry) {
        return {
          id: horseId,
          laneIndex,
          name: horseLookup.value.get(horseId)?.name ?? `Horse ${horseId}`,
          progress: 1,
          trackProgress: 1,
          finished: true,
          timeLabel: '—',
          color: horseLookup.value.get(horseId)?.color ?? '#4f46e5',
        }
      }
      return {
        id: entry.horseId,
        laneIndex,
        name: horseLookup.value.get(entry.horseId)?.name ?? `Horse ${entry.horseId}`,
        progress: 1,
        trackProgress: 1,
        finished: true,
        timeLabel: `${(entry.elapsedMs / 1000).toFixed(2)} s`,
        color: horseLookup.value.get(entry.horseId)?.color ?? '#4f46e5',
      }
    })
  }

  const preview = previewResult.value
  if (!preview) {
    return round.horseIds.map((horseId, index) => ({
      id: horseId,
      laneIndex: index,
      name: horseLookup.value.get(horseId)?.name ?? `Horse ${horseId}`,
      progress: 0,
      trackProgress: 0,
      finished: false,
      timeLabel: 'Ready',
      color: horseLookup.value.get(horseId)?.color ?? '#4f46e5',
    }))
  }

  const elapsed = elapsedMs.value
  const segments = roundSegments.value
  const entryMap = new Map<number, RaceRoundResult['entries'][number]>()
  preview.entries.forEach((entry) => entryMap.set(entry.horseId, entry))

  return round.horseIds.map((horseId, laneIndex) => {
    const entry = entryMap.get(horseId)
    if (!entry) {
      return {
        id: horseId,
        laneIndex,
        name: horseLookup.value.get(horseId)?.name ?? `Horse ${horseId}`,
        progress: 0,
        trackProgress: 0,
        finished: false,
        timeLabel: '—',
        color: horseLookup.value.get(horseId)?.color ?? '#4f46e5',
      }
    }
    const totalTime = entry.elapsedMs
    const progressFraction = computeSegmentProgress(segments[horseId], elapsed, totalTime)
    const finished = elapsed >= totalTime
    const distanceCovered = Math.round(progressFraction * round.distance)
    return {
      id: horseId,
      laneIndex,
      name: horseLookup.value.get(horseId)?.name ?? `Horse ${horseId}`,
      progress: progressFraction,
      trackProgress: Math.min(1, Math.max(0, progressFraction)),
      finished,
      timeLabel: finished
        ? `${(totalTime / 1000).toFixed(2)} s`
        : `${distanceCovered} m`,
      color: horseLookup.value.get(horseId)?.color ?? '#4f46e5',
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
.race-track {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.race-track__status {
  flex: 1;
  display: grid;
  place-items: center;
  color: #6b7280;
  font-size: 0.95rem;
}

.race-track__inner {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
  min-height: 0;
}

.race-track__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 0.75rem;
  padding: 0.75rem 0.5rem;
}

.race-track__header h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.race-track__header span {
  display: block;
  font-size: 0.82rem;
  color: #64748b;
}

.race-track__badge {
  min-width: 4.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.race-track__badge--live {
  background: rgba(244, 63, 94, 0.18);
  color: #be123c;
}

.race-track__badge--paused {
  background: rgba(250, 204, 21, 0.18);
  color: #b45309;
}

.race-track__badge--awaiting {
  background: rgba(59, 130, 246, 0.18);
  color: #1d4ed8;
}

.race-track__badge--finished {
  background: rgba(34, 197, 94, 0.18);
  color: #166534;
}

.race-track__badge--ready {
  background: rgba(148, 163, 184, 0.18);
  color: #475569;
}

.race-track__track {
  position: relative;
  flex: 1;
  min-height: 0;
  padding: 0.75rem 1rem 1rem;
  display: grid;
  grid-template-rows: repeat(var(--lane-count, 1), minmax(2.8rem, 1fr));
  row-gap: 0.2rem;
  overflow: auto;
}

.race-track__track::after {
  content: '';
  position: absolute;
  top: 0.75rem;
  bottom: 1rem;
  right: 0.75rem;
  width: 0.25rem;
  background: repeating-linear-gradient(
    0deg,
    rgba(248, 250, 252, 0.95),
    rgba(248, 250, 252, 0.95) 6px,
    rgba(71, 85, 105, 0.45) 6px,
    rgba(71, 85, 105, 0.45) 12px
  );
  border-radius: 0.2rem;
}

@media (max-height: 760px) {
  .race-track__track {
    overflow-y: auto;
    scrollbar-width: thin;
  }
}

.race-track__lane {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.25rem 1rem 0.25rem 0.5rem;
}

.race-track__lane-number {
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  width: 2rem;
}

.race-track__lane-body {
  display: block;
}

.race-track__lane-track {
  position: relative;
  height: 100%;
  min-height: 2.8rem;
  flex: 1;
  padding: 0 2.4rem 0.1rem 2.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px dashed rgba(148, 163, 184, 0.45);
  z-index: 1;
}

.race-track__lane-label {
  flex: 1;
  font-weight: 600;
  color: #1f2937;
  font-size: 0.82rem;
  pointer-events: none;
  text-align: center;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  line-height: 1;
}

.race-track__horse-wrapper {
  position: absolute;
  top: 50%;
  left: calc(2.4rem + (100% - 4.8rem) * var(--progress, 0));
  transform: translate(-50%, -50%);
  transition: left 0.18s linear;
  z-index: 1;
}

.race-track__horse {
  width: 3.4rem;
  height: 2.2rem;
  position: relative;
  background-color: var(--horse-color, #4f46e5);
  mask-image: url('@/assets/horse_idle.gif');
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: contain;
  -webkit-mask-image: url('@/assets/horse_idle.gif');
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  -webkit-mask-size: contain;
  filter: drop-shadow(0 1px 3px rgba(15, 23, 42, 0.18));
}

.race-track__horse::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('@/assets/horse_idle.gif');
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  mix-blend-mode: multiply;
  opacity: 0.55;
  pointer-events: none;
}

.race-track__horse--running::after {
  background-image: url('@/assets/horse.gif');
  opacity: 0.65;
}

.race-track__horse--running {
  mask-image: url('@/assets/horse.gif');
  -webkit-mask-image: url('@/assets/horse.gif');
}

.race-track__horse--paused::after,
.race-track__horse--finished::after,
.race-track__horse--idle::after {
  background-image: url('@/assets/horse_idle.gif');
  opacity: 0.55;
}
</style>
