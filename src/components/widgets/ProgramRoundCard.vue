<template>
  <li
    class="program-round-card"
    :class="{ 'program-round-card--active': active }"
  >
    <header class="program-round-card__header">
      <span class="program-round-card__index">{{ index }}</span>
      <div class="program-round-card__details">
        <h3>{{ title }}</h3>
        <span>{{ distance }} m</span>
      </div>
      <span class="program-round-card__count">{{ countLabel }}</span>
    </header>
    <ul class="program-round-card__horse-list">
      <li
        v-for="horse in horses"
        :key="horse"
        class="program-round-card__horse"
      >
        {{ horse }}
      </li>
    </ul>
  </li>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  name: 'ProgramRoundCard',
  props: {
    index: {
      type: [Number, String] as PropType<number | string>,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    distance: {
      type: Number,
      required: true,
    },
    horses: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    active: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const countLabel = computed(() => `${props.horses.length} horses`)

    return {
      countLabel,
    }
  },
})
</script>

<style scoped>
.program-round-card {
  background: rgba(248, 250, 252, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 0.85rem;
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.program-round-card--active {
  border-color: rgba(79, 70, 229, 0.6);
}

.program-round-card__header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.program-round-card__index {
  width: 2.1rem;
  height: 2.1rem;
  border-radius: 0.7rem;
  background: #4f46e5;
  display: grid;
  place-items: center;
  color: #f9fafb;
  font-weight: 700;
  font-size: 0.95rem;
}

.program-round-card__details {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.program-round-card__details h3 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1f2937;
}

.program-round-card__details span {
  font-size: 0.8rem;
  color: #64748b;
}

.program-round-card__count {
  margin-left: auto;
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 600;
}

.program-round-card__horse-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.45rem;
  font-size: 0.85rem;
  color: #1f2937;
}

.program-round-card__horse {
  padding: 0.45rem 0.55rem;
  border-radius: 0.5rem;
  background: #ffffff;
  border: 1px solid rgba(148, 163, 184, 0.2);
}
</style>


