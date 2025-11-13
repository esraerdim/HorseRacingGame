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
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: var(--app-panel-padding, 1rem);
}
</style>


