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
  min-width: 3.6rem;
  padding: 0.28rem 0.65rem;
  border-radius: 0.6rem;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #1f2937;
  background: rgba(148, 163, 184, 0.12);
  border: 1px solid rgba(148, 163, 184, 0.28);
}

.app-badge--accent {
  background: rgba(79, 70, 229, 0.12);
  color: #4338ca;
  border-color: rgba(79, 70, 229, 0.24);
}

.app-badge--success {
  background: rgba(34, 197, 94, 0.14);
  color: #15803d;
  border-color: rgba(34, 197, 94, 0.26);
}

.app-badge--warning {
  background: rgba(250, 204, 21, 0.16);
  color: #b45309;
  border-color: rgba(250, 204, 21, 0.28);
}

.app-badge--info {
  background: rgba(59, 130, 246, 0.14);
  color: #1d4ed8;
  border-color: rgba(59, 130, 246, 0.24);
}

.app-badge--neutral {
  background: rgba(148, 163, 184, 0.12);
  color: #1e293b;
  border-color: rgba(148, 163, 184, 0.26);
}

.app-badge--danger {
  background: rgba(248, 113, 113, 0.14);
  color: #b91c1c;
  border-color: rgba(248, 113, 113, 0.26);
}
</style>


