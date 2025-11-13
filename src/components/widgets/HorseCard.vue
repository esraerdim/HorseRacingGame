<template>
  <component :is="as" class="horse-card">
    <span
      class="horse-card__swatch"
      :style="{ backgroundColor: horse.color }"
      aria-hidden="true"
    />
    <div class="horse-card__meta">
      <span class="horse-card__name">{{ horse.name }}</span>
      <span class="horse-card__stats">Condition: {{ horse.condition }}</span>
    </div>
  </component>
</template>

<script lang="ts">
import type { PropType } from 'vue'
import type { Horse } from '@/types'

export default {
  name: 'HorseCard',
  props: {
    horse: {
      type: Object as PropType<Horse>,
      required: true,
    },
    as: {
      type: String,
      default: 'li',
    },
  },
}
</script>

<style scoped>
.horse-card {
  display: flex;
  gap: 0.55rem;
  align-items: center;
  padding: 0.55rem 0.65rem;
  border-radius: 0.6rem;
  background: rgba(248, 250, 252, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.horse-card__swatch {
  flex-shrink: 0;
  width: 2.1rem;
  height: 2.1rem;
  border-radius: 0.6rem;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.12);
}

.horse-card__meta {
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
}

.horse-card__name {
  font-weight: 600;
  font-size: 0.92rem;
  color: #1f2937;
}

.horse-card__stats {
  font-size: 0.72rem;
  color: #6b7280;
}
</style>


