<template>
  <AppPanel class="horse-list-panel" padding="1.25rem">
    <header class="horse-list-panel__header">
      <h2>Horse Roster</h2>
      <span class="horse-list-panel__meta">
        {{ horses.length }} / {{ totalHorses }} horses
      </span>
    </header>

    <div v-if="isGenerating" class="horse-list-panel__state">
      <span class="horse-list-panel__spinner" aria-hidden="true" />
      <span>Generating horse pool…</span>
    </div>
    <ul v-else class="horse-list-panel__grid">
      <HorseCard v-for="horse in orderedHorses" :key="horse.id" :horse="horse" />
    </ul>

    <p v-if="!horses.length && !isGenerating" class="horse-list-panel__empty">
      No horses have been generated yet. Click Generate to build the roster.
    </p>
  </AppPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import type { Horse } from '@/types'
import type { RootState } from '@/store'
import AppPanel from '@/components/primitives/AppPanel.vue'
import HorseCard from '../compounds/HorseCard.vue'

const store = useStore<RootState>()

const horses = computed(() => store.getters['horses/horsePool'] as Horse[])
const totalHorses = computed(() => store.getters['horses/horseCount'] as number)
const isGenerating = computed(
  () => store.getters['horses/isGenerating'] as boolean,
)

const orderedHorses = computed(() => horses.value)
</script>

<style scoped>
.horse-list-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.horse-list-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.horse-list-panel__header h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.horse-list-panel__meta {
  font-size: 0.875rem;
  color: #6b7280;
}

.horse-list-panel__state {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  color: #374151;
  flex: 1;
  justify-content: center;
}

.horse-list-panel__spinner {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  border: 2px solid #a5b4fc;
  border-top-color: transparent;
  animation: spin 0.9s linear infinite;
}

.horse-list-panel__grid {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  list-style: none;
  margin: 0;
  padding: 0 0.15rem 0 0;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.horse-list-panel__empty {
  margin: auto 0 0;
  font-size: 0.9rem;
  color: #6b7280;
  text-align: center;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

