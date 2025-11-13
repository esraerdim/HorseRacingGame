<template>
  <component :is="as" class="live-entry">
    <span class="live-entry__position">{{ position }}</span>
    <span class="live-entry__name">{{ name }}</span>
    <span v-if="timeLabel" class="live-entry__time">{{ timeLabel }}</span>
  </component>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  name: 'LiveBoardEntry',
  props: {
    position: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    timeLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    as: {
      type: String,
      default: 'li',
    },
  },
})
</script>

<style scoped>
.live-entry {
  display: grid;
  grid-template-columns: 2.5rem 1fr auto;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 0.6rem;
  border-radius: 0.6rem;
  background: rgba(248, 250, 252, 0.96);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.live-entry__position {
  font-weight: 700;
  color: #1f2937;
  font-size: 0.85rem;
}

.live-entry__name {
  font-weight: 500;
  color: #1f2937;
  font-size: 0.85rem;
}

.live-entry__time {
  font-size: 0.75rem;
  color: #6b7280;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 1024px) {
  .live-entry {
    grid-template-columns: 2rem 1fr;
  }

  .live-entry__time {
    justify-self: flex-end;
  }
}
</style>


