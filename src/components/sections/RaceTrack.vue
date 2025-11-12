<template>
  <section class="race-track">
    <div class="race-track__inner">
      <div class="race-track__superheader">
        <RaceTrackHeader
          :title="headerTitle"
          :subtitle="headerSubtitle"
          :status="headerStatus"
          :tone="headerTone"
        />
      </div>
      <div
        class="race-track__track"
        :key="activeRound?.roundNumber ?? 'track'"
        :style="{ '--lane-count': laneCount }"
      >
        <video
          v-if="isRunning"
          class="race-track__video"
          :src="raceAnimation"
          autoplay
          loop
          muted
          playsinline
        />
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
import { RaceTrackHeader, RaceTrackLane } from '@/components/compounds'
import { RACE_HORSES_PER_ROUND } from '@/config/race-config'
import raceAnimation from '@/assets/race_animation.mp4'

const {
  status,
  activeRound,
  runners,
  showAnimatedHorse,
  isPaused,
  statusLabel,
  statusTone,
  formatLap,
} = useRaceTrack()

const laneCount = computed(() =>
  Math.max(runners.value.length, RACE_HORSES_PER_ROUND),
)

const headerTitle = computed(() =>
  activeRound.value ? formatLap(activeRound.value.roundNumber) : 'Track Ready',
)

const headerSubtitle = computed(() =>
  activeRound.value ? `${activeRound.value.distance} m` : 'Awaiting schedule',
)

const headerStatus = computed(() => (activeRound.value ? statusLabel.value : 'Idle'))
const headerTone = computed(() => (activeRound.value ? statusTone.value : 'neutral'))
const isRunning = computed(() => status.value === 'running')
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
  background: url('@/assets/horse_track.png') center 100% / cover no-repeat;
  border-radius: 1.3rem;
  padding: 0;
  position: relative;
  overflow: hidden;
}

.race-track__superheader {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  margin: 0;
  padding: 0;
}

.race-track__track {
  position: relative;
  flex: 0 0 auto;
  height: min(450px, 55%);
  padding: 0.3rem 0.15rem 0.45rem;
  display: grid;
  grid-template-rows: repeat(var(--lane-count, 1), minmax(2.25rem, 1fr));
  row-gap: 0.18rem;
  overflow: hidden;
  background:
    linear-gradient(
      to bottom,
      rgba(148, 163, 184, 0.2) 0,
      rgba(148, 163, 184, 0.2) 1px,
      transparent 1px,
      transparent
    ),
    rgba(255, 255, 255, 0.4);
  background-size: 100%
    calc((100% - 0.45rem) / max(var(--lane-count, 1), 1));
  margin-bottom: 0;
  margin-top: 2.5rem;
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

.race-track__video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  pointer-events: none;
  mix-blend-mode: multiply;
  opacity: 0.72;
}

.race-track__track > :not(.race-track__video) {
  position: relative;
  z-index: 1;
}

.race-track__placeholder {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

@media (max-height: 760px) {
  .race-track__track {
    overflow-y: auto;
    scrollbar-width: thin;
  }
}
</style>
