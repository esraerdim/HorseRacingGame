<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue'
import AppPanel from '../primitives/AppPanel.vue'

const activeTab = ref<'program' | 'results'>('program')

const ProgramPanel = defineAsyncComponent(
  () => import('./ProgramPanel.vue'),
)
const ResultsPanel = defineAsyncComponent(
  () => import('./ResultsPanel.vue'),
)
</script>

<template>
  <AppPanel class="program-results" padding="1.25rem">
    <header class="program-results__tabs">
      <button
        type="button"
        class="program-results__tab"
        :class="{ 'program-results__tab--active': activeTab === 'program' }"
        @click="activeTab = 'program'"
      >
        Program
      </button>
      <button
        type="button"
        class="program-results__tab"
        :class="{ 'program-results__tab--active': activeTab === 'results' }"
        @click="activeTab = 'results'"
      >
        Results
      </button>
    </header>

    <div class="program-results__content">
      <ProgramPanel v-if="activeTab === 'program'" />
      <ResultsPanel v-else />
    </div>
  </AppPanel>
</template>

<style scoped>
.program-results {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
  min-height: 0;
}

.program-results__tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  background: rgba(248, 250, 252, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 0.75rem;
  padding: 0.3rem;
  gap: 0.5rem;
}

.program-results__tab {
  appearance: none;
  border: none;
  border-radius: 0.6rem;
  font-weight: 600;
  font-size: 0.95rem;
  padding: 0.6rem 0.75rem;
  background: transparent;
  color: #475569;
  cursor: pointer;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.program-results__tab:hover {
  background: rgba(79, 70, 229, 0.08);
  color: #312e81;
}

.program-results__tab--active {
  background: #4f46e5;
  color: #f9fafb;
  box-shadow: 0 10px 18px rgba(79, 70, 229, 0.18);
}

.program-results__content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
</style>
