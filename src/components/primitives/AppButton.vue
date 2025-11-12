<template>
  <button
    :type="type"
    class="app-button"
    :class="[
      `app-button--${variant}`,
      `app-button--size-${size}`,
      { 'app-button--block': block },
    ]"
    v-bind="attrs"
  >
    <slot />
  </button>
</template>

<script lang="ts">
import { defineComponent, toRefs, useAttrs } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  name: 'AppButton',
  props: {
    type: {
      type: String as PropType<'button' | 'submit' | 'reset'>,
      default: 'button',
    },
    variant: {
      type: String as PropType<'default' | 'primary'>,
      default: 'default',
    },
    size: {
      type: String as PropType<'xs' | 'sm' | 'md'>,
      default: 'md',
    },
    block: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const { type, variant, block, size } = toRefs(props)
    const attrs = useAttrs()

    return {
      type,
      variant,
      size,
      block,
      attrs,
    }
  },
})
</script>

<style scoped>
.app-button {
  appearance: none;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(249, 250, 252, 0.92);
  color: #312e81;
  border-radius: 0.55rem;
  padding: 0.5rem 0.9rem;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    background 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s ease;
  outline: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  text-align: center;
}

.app-button--size-sm {
  padding: 0.4rem 0.7rem;
  font-size: 0.82rem;
  border-radius: 0.5rem;
  gap: 0.3rem;
}

.app-button--size-xs {
  padding: 0.32rem 0.6rem;
  font-size: 0.78rem;
  border-radius: 0.45rem;
  gap: 0.25rem;
}

.app-button--block {
  width: 100%;
}

.app-button:hover:enabled {
  transform: translateY(-1px);
  background: rgba(79, 70, 229, 0.08);
  box-shadow: 0 8px 16px rgba(79, 70, 229, 0.14);
  border-color: rgba(79, 70, 229, 0.2);
}

.app-button:active:enabled {
  transform: translateY(0);
}

.app-button:focus-visible {
  border-color: rgba(79, 70, 229, 0.45);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.18);
}

.app-button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
  transform: none;
  box-shadow: none;
  border-color: rgba(148, 163, 184, 0.25);
}

.app-button--primary {
  background: #4338ca;
  border-color: rgba(79, 70, 229, 0.4);
  color: #f9fafb;
  box-shadow: 0 8px 16px rgba(79, 70, 229, 0.18);
}

.app-button--primary:hover:enabled {
  background: #3730a3;
  box-shadow: 0 10px 20px rgba(79, 70, 229, 0.22);
}

.app-button--primary:disabled {
  background: rgba(79, 70, 229, 0.5);
  color: rgba(249, 250, 251, 0.85);
  border-color: rgba(79, 70, 229, 0.25);
}
</style>


