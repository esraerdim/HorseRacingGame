<template>
  <section class="race-track">
    <div class="race-track__inner" :class="{ 'race-track__inner--idle': !isRunning }">
      <video
        v-if="isRunning"
        class="race-track__video"
        :src="raceAnimation"
        autoplay
        loop
        muted
        playsinline
      />
      <div v-if="lapLabel || distanceLabel" class="race-track__header">
        <span v-if="lapLabel" class="race-track__lap">{{ lapLabel }}</span>
        <span v-if="distanceLabel" class="race-track__distance">{{ distanceLabel }}</span>
      </div>
      <div
        class="race-track__track"
        :key="activeRound?.roundNumber ?? 'track'"
        :style="{ '--lane-count': laneCount }"
      >
        <template v-if="runners.length">
          <RaceTrackLane
            v-for="runner in runners"
            :key="runner.id"
            :lane-index="runner.laneIndex"
            :name="runner.name"
            :progress="runner.trackProgress"
            :color="runner.color"
            :running="showAnimatedHorse && !runner.finished"
            :finished="runner.finished"
            :paused="isPaused"
          />
        </template>
        <div v-else class="race-track__placeholder" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRaceTrack } from '@/composables/useRaceTrack'
import { RaceTrackLane } from '@/components/compounds'
import { RACE_HORSES_PER_ROUND } from '@/config/race-config'
import raceAnimation from '@/assets/race_animation.mp4'

const {
  status,
  activeRound,
  runners,
  showAnimatedHorse,
  isPaused,
  formatLap,
} = useRaceTrack()

const laneCount = computed(() =>
  Math.max(runners.value.length, RACE_HORSES_PER_ROUND),
)

const isRunning = computed(() => status.value === 'running')

const distanceLabel = computed(() => {
  if (activeRound.value) {
    return `${activeRound.value.distance}m`
  }
  return null
})

const lapLabel = computed(() =>
  activeRound.value ? formatLap(activeRound.value.roundNumber) : null,
)
</script>

<style scoped>
.race-track {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.race-track__inner {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 0.6rem;
  height: 100%;
  min-height: 0;
  border-radius: 1.3rem;
  padding: 0;
  position: relative;
  overflow: hidden;
}

.race-track__inner--idle {
  background: url('@/assets/horse_track.png') center 100% / cover no-repeat;
}

.race-track__track {
  position: relative;
  flex: 1;
  max-height: min(450px, 55%);
  padding: 0.7rem 0.15rem 0.1rem;
  display: grid;
  grid-template-rows: repeat(var(--lane-count, 1), minmax(2.4rem, 1fr));
  row-gap: 0.06rem;
  overflow: hidden;
  background:
    linear-gradient(
      to bottom,
      rgba(148, 163, 184, 0.12) 0,
      rgba(148, 163, 184, 0.12) 1px,
      transparent 1px,
      transparent
    ),
    rgba(255, 255, 255, 0.18);
  background-size: 100%
    calc((100% - 0.45rem) / max(var(--lane-count, 1), 1));
  margin-bottom: 0;
  margin-top: 0;
}

.race-track__track::after {
  content: '';
  position: absolute;
  top: 1.25rem;
  bottom: 0.5rem;
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

.race-track__video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  pointer-events: none;
  mix-blend-mode: multiply;
  opacity: 1;
}

.race-track__inner > :not(.race-track__video) {
  position: relative;
  z-index: 1;
}

.race-track__placeholder {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.race-track__header {
  position: absolute;
  top: 0.35rem;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 1.2rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: rgba(248, 250, 252, 0.96);
  text-shadow:
    0 4px 12px rgba(15, 23, 42, 0.45),
    0 1px 6px rgba(15, 23, 42, 0.35);
  pointer-events: none;
  z-index: 2;
}

.race-track__lap {
  font-size: 0.92rem;
}

.race-track__distance {
  font-size: 0.88rem;
}

@media (max-height: 760px) {
  .race-track__track {
    overflow-y: auto;
    scrollbar-width: thin;
  }
}
</style>
