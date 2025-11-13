<template>
  <div class="app-progress" role="progressbar" :aria-valuenow="value" aria-valuemin="0" aria-valuemax="100">
    <div class="app-progress__bar" :class="`app-progress__bar--${tone}`" :style="{ width: `${clampedValue}%` }" />
  </div>
</template>

<script lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'

export default {
  name: 'AppProgressBar',
  props: {
    value: {
      type: Number,
      default: 0,
    },
    tone: {
      type: String as PropType<'accent' | 'success' | 'info' | 'muted' | 'warning'>,
      default: 'accent',
    },
  },
  setup(props) {
    const clampedValue = computed(() => Math.max(0, Math.min(100, props.value ?? 0)))

    return {
      clampedValue,
    }
  },
}
</script>

<style scoped>
.app-progress {
  position: relative;
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.25);
  overflow: hidden;
}

.app-progress__bar {
  height: 100%;
  transition: width 0.12s linear;
  background: linear-gradient(90deg, #4f46e5 0%, #22d3ee 100%);
}

.app-progress__bar--success {
  background: linear-gradient(90deg, #22c55e 0%, #86efac 100%);
}

.app-progress__bar--info {
  background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
}

.app-progress__bar--muted {
  background: linear-gradient(90deg, #94a3b8 0%, #cbd5f5 100%);
}

.app-progress__bar--warning {
  background: linear-gradient(90deg, #facc15 0%, #fbbf24 100%);
}
</style>


