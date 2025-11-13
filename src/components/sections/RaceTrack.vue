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
      <div
        v-if="(!isCountdown || countdownSeconds <= 0) && (lapLabel || distanceLabel)"
        class="race-track__header"
      >
        <span v-if="lapLabel" class="race-track__lap">{{ lapLabel }}</span>
        <span v-if="distanceLabel" class="race-track__distance">{{ distanceLabel }}</span>
      </div>
      <div v-if="isCountdown && countdownSeconds > 0" class="race-track__countdown">
        <div class="race-track__countdown-ring">
          <svg
            class="race-track__countdown-svg"
            viewBox="0 0 180 180"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <linearGradient :id="COUNTDOWN_GRADIENT_ID" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#a855f7" />
                <stop offset="100%" stop-color="#4338ca" />
              </linearGradient>
            </defs>
            <circle
              class="race-track__countdown-circle race-track__countdown-circle--base"
              cx="90"
              cy="90"
              :r="COUNTDOWN_RADIUS"
            />
            <circle
              class="race-track__countdown-circle race-track__countdown-circle--progress"
              cx="90"
              cy="90"
              :r="COUNTDOWN_RADIUS"
              :stroke-dasharray="countdownCircumference"
              :stroke-dashoffset="countdownStrokeDashoffset"
              :stroke="countdownGradientUrl"
              transform="rotate(-90 90 90)"
            />
          </svg>
          <div class="race-track__countdown-text">
            <span class="race-track__countdown-label">Next race</span>
            <span class="race-track__countdown-label">starts in</span>
            <span class="race-track__countdown-value">{{ countdownSeconds }}</span>
            <span class="race-track__countdown-label-secondary">seconds</span>
          </div>
        </div>
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
import { useRaceTrack } from '@/shared/hooks/useRaceTrack'
import RaceTrackLane from '@/components/widgets/RaceTrackLane.vue'
import { RACE_HORSES_PER_ROUND } from '@/shared/config/race'
import raceAnimation from '@/assets/race_animation.mp4?url'

const {
  status,
  activeRound,
  runners,
  showAnimatedHorse,
  isPaused,
  isCountdown,
  countdownSeconds,
  countdownProgress,
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

const COUNTDOWN_RADIUS = 70
const COUNTDOWN_GRADIENT_ID = 'race-track-countdown-gradient'
const countdownGradientUrl = `url(#${COUNTDOWN_GRADIENT_ID})`
const countdownCircumference = 2 * Math.PI * COUNTDOWN_RADIUS
const countdownStrokeDashoffset = computed(() => {
  if (!isCountdown.value) {
    return countdownCircumference
  }
  const ratio = Math.max(0, Math.min(1, countdownProgress.value))
  return countdownCircumference * (1 - ratio)
})
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
  min-height: clamp(340px, 52vh, 520px);
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
  max-height: clamp(260px, 60vh, 500px);
  padding: 0.6rem 0.15rem 0.75rem;
  display: grid;
  grid-template-rows: repeat(var(--lane-count, 1), minmax(2rem, 1fr));
  row-gap: 0.04rem;
  overflow-y: auto;
  scrollbar-width: thin;
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
  bottom: 1.2rem;
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

.race-track__countdown {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 4.2rem 0 0;
  background: transparent !important;
  z-index: 3;
  pointer-events: none;
}

.race-track__countdown-ring {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: clamp(200px, 22vw, 260px);
  aspect-ratio: 1/1;
  position: relative;
  padding: 1.4rem;
}

.race-track__countdown-svg {
  position: absolute;
  inset: 0;
}

.race-track__countdown-circle {
  fill: none;
  stroke-width: 12;
  transition: stroke-dashoffset 0.12s linear;
}

.race-track__countdown-circle--base {
  stroke: rgba(226, 232, 240, 0.35);
}

.race-track__countdown-circle--progress {
  stroke-linecap: round;
}

.race-track__countdown-text {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  text-align: center;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0;
}

.race-track__countdown-label {
  font-size: clamp(0.62rem, 1vw, 0.74rem);
  font-weight: 700;
  letter-spacing: 0.08em;
}

.race-track__countdown-value {
  font-size: clamp(2.4rem, 4.2vw, 3rem);
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.1em;
}

.race-track__countdown-label-secondary {
  font-size: clamp(0.6rem, 1vw, 0.75rem);
  font-weight: 600;
  color: rgba(249, 250, 255, 0.9);
}

@media (max-width: 1024px) {
  .race-track__inner {
    min-height: clamp(360px, 58vh, 560px);
  }

  .race-track__track {
    max-height: clamp(280px, 48vh, 480px);
    height: calc(2.2rem * var(--lane-count, 8) + 5rem);
  }
}

@media (max-width: 640px) {
  .race-track__inner {
    min-height: clamp(400px, 68vh, 620px);
  }

  .race-track__track {
    max-height: none;
    height: calc(2.3rem * var(--lane-count, 10) + 5.4rem);
  }
}
</style>
