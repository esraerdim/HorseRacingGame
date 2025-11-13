<template>
  <li class="result-round-card">
    <header class="result-round-card__header">
      <div>
        <h3>{{ title }}</h3>
        <span>{{ distance }} m</span>
      </div>
      <span class="result-round-card__duration">
        Top time: {{ topTime }}
      </span>
    </header>
    <table class="result-round-card__table">
      <thead>
        <tr>
          <th scope="col">Pos</th>
          <th scope="col">Name</th>
          <th scope="col">Time (s)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="entry in entries" :key="entry.horseId">
          <td>{{ entry.position }}</td>
          <td>{{ entry.horseName }}</td>
          <td>{{ entry.timeLabel }}</td>
        </tr>
      </tbody>
    </table>
  </li>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'

interface ResultEntry {
  horseId: number
  horseName: string
  position: number
  timeLabel: string
}

export default defineComponent({
  name: 'ResultRoundCard',
  props: {
    title: {
      type: String,
      required: true,
    },
    distance: {
      type: Number,
      required: true,
    },
    topTime: {
      type: String,
      required: true,
    },
    entries: {
      type: Array as PropType<ResultEntry[]>,
      default: () => [],
    },
  },
})
</script>

<style scoped>
.result-round-card {
  background: rgba(248, 250, 252, 0.95);
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 0.85rem;
  padding: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.result-round-card__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}

.result-round-card__header h3 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
}

.result-round-card__header span {
  display: block;
  font-size: 0.8rem;
  color: #64748b;
}

.result-round-card__duration {
  font-size: 0.78rem;
  color: #4b5563;
  font-weight: 600;
}

.result-round-card__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.result-round-card__table th {
  text-align: left;
  color: #475569;
  font-weight: 600;
  padding-bottom: 0.35rem;
}

.result-round-card__table td {
  padding: 0.35rem 0;
  border-top: 1px solid rgba(148, 163, 184, 0.25);
  color: #111827;
}
</style>


