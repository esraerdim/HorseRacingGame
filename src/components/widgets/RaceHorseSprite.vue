<template>
  <div
    class="race-horse-wrapper"
    :class="wrapperClasses"
    :style="wrapperStyle"
  >
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
    const isRunning = computed(() => props.running && !props.finished)

    const horseClasses = computed(() => ({
      'race-horse--running': isRunning.value,
      'race-horse--idle': !isRunning.value,
      'race-horse--paused': props.paused,
      'race-horse--finished': props.finished,
    }))

    const wrapperClasses = computed(() => ({
      'race-horse-wrapper--running': isRunning.value,
    }))

    const wrapperStyle = computed(() => ({
      '--progress': Math.min(1, Math.max(0, props.progress)),
    }))

    return {
      horseClasses,
      wrapperClasses,
      wrapperStyle,
    }
  },
})
</script>

<style scoped>
.race-horse-wrapper {
  position: absolute;
  top: 50%;
  left: calc(2.25rem + (100% - 4.4rem) * var(--progress, 0));
  transform: translate(-50%, -50%);
  transition: left 0.12s linear;
  z-index: 1;
}

.race-horse-wrapper--running {
  animation: horse-bob 0.26s ease-in-out infinite alternate;
  animation-delay: calc((var(--progress, 0) * 0.18s));
}

@keyframes horse-bob {
  from {
    transform: translate(-50%, -53%) scale(1.04) rotate(-0.8deg);
  }
  to {
    transform: translate(-50%, -47.5%) scale(0.96) rotate(0.8deg);
  }
}

.race-horse {
  width: 4.6rem;
  height: 3.9rem;
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
  filter:
    drop-shadow(0 0.22rem 0.45rem rgba(15, 23, 42, 0.1))
    drop-shadow(0 0.6rem 1.2rem rgba(49, 46, 129, 0.18));
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
  opacity: 0.18;
  pointer-events: none;
}

.race-horse--running::after {
  background-image: url('@/assets/horse.gif');
  opacity: 0.26;
}

.race-horse--running {
  mask-image: url('@/assets/horse.gif');
  -webkit-mask-image: url('@/assets/horse.gif');
  animation: horse-stride 0.18s ease-in-out infinite alternate;
}

@keyframes horse-stride {
  from {
    transform: scaleX(1.04) translateY(-1.3px);
  }
  to {
    transform: scaleX(0.96) translateY(1.3px);
  }
}

.race-horse--paused::after,
.race-horse--finished::after,
.race-horse--idle::after {
  background-image: url('@/assets/horse_idle.gif');
  opacity: 0.18;
}
</style>


