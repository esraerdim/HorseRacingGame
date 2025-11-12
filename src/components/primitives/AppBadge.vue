<template>
  <span class="app-badge" :class="`app-badge--${tone}`" v-bind="attrs">
    <slot />
  </span>
</template>

<script lang="ts">
import { computed, defineComponent, useAttrs } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  name: 'AppBadge',
  props: {
    tone: {
      type: String as PropType<'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'>,
      default: 'neutral',
    },
  },
  setup(props) {
    const attrs = useAttrs()
    const tone = computed(() => props.tone)

    return {
      attrs,
      tone,
    }
  },
})
</script>

<style scoped>
.app-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 4rem;
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.app-badge--accent {
  background: rgba(244, 63, 94, 0.18);
  color: #be123c;
}

.app-badge--success {
  background: rgba(34, 197, 94, 0.18);
  color: #166534;
}

.app-badge--warning {
  background: rgba(250, 204, 21, 0.18);
  color: #b45309;
}

.app-badge--info {
  background: rgba(59, 130, 246, 0.18);
  color: #1d4ed8;
}

.app-badge--neutral {
  background: rgba(148, 163, 184, 0.18);
  color: #475569;
}

.app-badge--danger {
  background: rgba(244, 63, 94, 0.18);
  color: #b91c1c;
}
</style>


