<template>
  <header class="race-track-header">
    <div>
      <h2>{{ title }}</h2>
      <span>{{ subtitle }}</span>
    </div>
    <AppBadge :tone="tone" class="race-track-header__badge">
      {{ status }}
    </AppBadge>
  </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import AppBadge from '@/components/primitives/AppBadge.vue'

export default defineComponent({
  name: 'RaceTrackHeader',
  components: {
    AppBadge,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    tone: {
      type: String as PropType<'accent' | 'success' | 'warning' | 'info' | 'neutral'>,
      default: 'neutral',
    },
  },
})
</script>

<style scoped>
.race-track-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.9rem;
  background: linear-gradient(
    90deg,
    rgba(15, 23, 42, 0.55) 0%,
    rgba(15, 23, 42, 0.25) 60%,
    rgba(15, 23, 42, 0.38) 100%
  );
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.18);
}

.race-track-header h2 {
  margin: 0;
  font-size: 1.08rem;
  font-weight: 600;
  color: #f8fafc;
}

.race-track-header span {
  display: block;
  font-size: 0.78rem;
  color: rgba(226, 232, 240, 0.9);
  text-align: center;
}

.race-track-header__badge {
  min-width: 4.5rem;
  color: #f8fafc;
  line-height: 1;
}
</style>


