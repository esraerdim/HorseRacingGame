<template>
  <div class="controls">
    <AppButton
      variant="primary"
      size="xs"
      :disabled="isGenerating"
      @click="handleGenerate"
    >
      <span v-if="isGenerating">Generating…</span>
      <span v-else>Generate</span>
    </AppButton>
    <AppButton
      v-if="hasSchedule"
      size="xs"
      :disabled="raceStatus === 'finished'"
      @click="handleStartPause"
    >
      {{ startPauseLabel }}
    </AppButton>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import type { RootState } from '@/store'
import AppButton from '@/components/base/AppButton.vue'

const store = useStore<RootState>()

const isGenerating = computed(() => store.getters['horses/isGenerating'] as boolean)
const raceStatus = computed(() => store.state.race.status)
const hasSchedule = computed(() => store.state.race.schedule.length > 0)

const startPauseLabel = computed(() => {
  if (raceStatus.value === 'running') return 'Pause'
  if (raceStatus.value === 'paused') return 'Resume'
  if (raceStatus.value === 'countdown') return 'Skip Countdown'
  if (raceStatus.value === 'awaiting') return 'Next Lap'
  if (raceStatus.value === 'finished') return 'Race Finished'
  return 'Start'
})

const handleGenerate = async () => {
  await store.dispatch('generateRaceProgram')
}

const handleStartPause = () => {
  if (!hasSchedule.value) return
  if (raceStatus.value === 'running') {
    store.dispatch('race/pauseRace')
  } else if (raceStatus.value === 'paused') {
    store.dispatch('race/resumeRace')
  } else if (raceStatus.value === 'countdown') {
    store.dispatch('race/startNextRound')
  } else if (raceStatus.value === 'awaiting') {
    store.dispatch('race/startNextRound')
  } else {
    store.dispatch('race/startRace')
  }
}
</script>
<style scoped>
.controls {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: flex-start;
  padding: 0.1rem 0;
  flex-wrap: nowrap;
}
</style>

