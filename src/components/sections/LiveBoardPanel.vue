<template>
  <AppPanel class="live-board" padding="0.9rem 1rem">
    <header class="live-board__header">
      <div>
        <h2>{{ title }}</h2>
        <span class="live-board__subtitle">{{ subtitle }}</span>
      </div>
      <AppBadge class="live-board__badge" :tone="badgeTone">
        {{ statusLabel }}
      </AppBadge>
    </header>

    <div v-if="!activeRound" class="live-board__empty">
      <p>Generate a race to see the live board.</p>
    </div>
    <div v-else class="live-board__content">
      <div class="live-board__meta">
        <span>{{ formatLap(activeRound.roundNumber) }}</span>
        <span>{{ activeRound.distance }} m</span>
      </div>
      <AppProgressBar :value="progress" :tone="progressTone" />
      <TransitionGroup tag="ul" class="live-board__list" name="live-board">
        <LiveBoardEntry
          v-for="horse in liveEntries"
          :key="horse.id"
          :position="horse.positionLabel"
          :name="horse.name"
          :time-label="horse.timeLabel"
        />
      </TransitionGroup>
    </div>
  </AppPanel>
</template>

<script setup lang="ts">
import { useLiveBoard } from '@/composables/useLiveBoard'
import { AppPanel, AppBadge, AppProgressBar } from '@/components/primitives'
import { LiveBoardEntry } from '@/components/compounds'
const {
  activeRound,
  liveEntries,
  progress,
  progressTone,
  badgeTone,
  statusLabel,
  title,
  subtitle,
  formatLap,
} = useLiveBoard()
</script>

<style scoped>
.live-board {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
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
  min-width: 4rem;
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

</style>
