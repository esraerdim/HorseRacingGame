<template>
  <header class="app-section-header">
    <div class="app-section-header__titles">
      <h2>{{ title }}</h2>
      <p v-if="$slots.subtitle || subtitle" class="app-section-header__subtitle">
        <slot name="subtitle">{{ subtitle }}</slot>
      </p>
    </div>
    <div v-if="$slots.meta">
      <slot name="meta" />
    </div>
  </header>
</template>

<script lang="ts">
import type { PropType } from 'vue'

export default {
  name: 'AppSectionHeader',
  props: {
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
  },
}
</script>

<style scoped>
.app-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.app-section-header__titles {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.app-section-header h2 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: #111827;
}

.app-section-header__subtitle {
  margin: 0;
  font-size: 0.85rem;
  color: #6b7280;
}
</style>


