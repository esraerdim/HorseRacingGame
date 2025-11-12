<template>
  <component
    :is="as"
    class="app-panel"
    :style="paddingStyle"
    v-bind="attrs"
  >
    <slot />
  </component>
</template>

<script lang="ts">
import { computed, defineComponent, useAttrs } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  name: 'AppPanel',
  props: {
    as: {
      type: String as PropType<string>,
      default: 'section',
    },
    padding: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
  },
  setup(props) {
    const attrs = useAttrs()
    const paddingStyle = computed(() =>
      props.padding ? { '--app-panel-padding': props.padding } : undefined,
    )

    return {
      attrs,
      paddingStyle,
    }
  },
})
</script>

<style scoped>
.app-panel {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 1rem;
  box-shadow:
    0 12px 24px rgba(15, 23, 42, 0.08),
    0 2px 6px rgba(15, 23, 42, 0.05);
  padding: var(--app-panel-padding, 1rem);
}
</style>


