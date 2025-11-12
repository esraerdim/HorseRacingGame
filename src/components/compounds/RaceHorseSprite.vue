<template>
  <div class="race-horse-wrapper" :style="wrapperStyle">
    <div
      class="race-horse"
      :class="horseClasses"
      :style="{ '--horse-color': color }"
      aria-hidden="true"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

export default defineComponent({
  name: 'RaceHorseSprite',
  props: {
    progress: {
      type: Number,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    running: {
      type: Boolean,
      default: false,
    },
    finished: {
      type: Boolean,
      default: false,
    },
    paused: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const horseClasses = computed(() => ({
      'race-horse--running': props.running && !props.finished,
      'race-horse--idle': !props.running || props.finished,
      'race-horse--paused': props.paused,
      'race-horse--finished': props.finished,
    }))

    const wrapperStyle = computed(() => ({
      '--progress': Math.min(1, Math.max(0, props.progress)),
    }))

    return {
      horseClasses,
      wrapperStyle,
    }
  },
})
</script>

<style scoped>
.race-horse-wrapper {
  position: absolute;
  top: 50%;
  left: calc(2.25rem + (100% - 3.1rem) * var(--progress, 0));
  transform: translate(-50%, -50%);
  transition: left 0.18s linear;
  z-index: 1;
}

.race-horse {
  width: 3.9rem;
  height: 3.4rem;
  position: relative;
  background-color: var(--horse-color, #4f46e5);
  mask-image: url('@/assets/horse_idle.gif');
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: contain;
  -webkit-mask-image: url('@/assets/horse_idle.gif');
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  -webkit-mask-size: contain;
  filter: drop-shadow(0 1px 3px rgba(15, 23, 42, 0.18));
}

.race-horse::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('@/assets/horse_idle.gif');
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  mix-blend-mode: multiply;
  opacity: 0.55;
  pointer-events: none;
}

.race-horse--running::after {
  background-image: url('@/assets/horse.gif');
  opacity: 0.65;
}

.race-horse--running {
  mask-image: url('@/assets/horse.gif');
  -webkit-mask-image: url('@/assets/horse.gif');
}

.race-horse--paused::after,
.race-horse--finished::after,
.race-horse--idle::after {
  background-image: url('@/assets/horse_idle.gif');
  opacity: 0.55;
}
</style>


