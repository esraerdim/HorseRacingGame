<template>
  <div class="race-track-lane">
    <span class="race-track-lane__number">{{ laneNumber }}</span>
    <div class="race-track-lane__track">
      <span class="race-track-lane__label">{{ name }}</span>
      <RaceHorseSprite
        :progress="progress"
        :color="color"
        :running="running"
        :finished="finished"
        :paused="paused"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import RaceHorseSprite from '@/components/compounds/RaceHorseSprite.vue'

export default defineComponent({
  name: 'RaceTrackLane',
  components: {
    RaceHorseSprite,
  },
  props: {
    laneIndex: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
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
    const laneNumber = computed(() => props.laneIndex + 1)

    return {
      laneNumber,
    }
  },
})
</script>

<style scoped>
.race-track-lane {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.15rem 0.6rem 0.15rem 0.4rem;
  position: relative;
}

.race-track-lane__number {
  width: 1.85rem;
  height: 1.85rem;
  border-radius: 999px;
  background: rgba(248, 250, 252, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.35);
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.4),
    0 6px 12px rgba(15, 23, 42, 0.12);
  font-weight: 700;
  font-size: 0.85rem;
  color: #1f2937;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.race-track-lane__track {
  position: relative;
  height: 100%;
  min-height: 3.1rem;
  flex: 1;
  padding: 0 1.9rem 0.06rem 1.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px dashed rgb(231 239 251 / 45%);
  z-index: 1;
}

.race-track-lane__label {
  flex: 1;
  font-weight: 600;
  color: #1f2937;
  font-size: 0.82rem;
  pointer-events: none;
  text-align: center;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  line-height: 1;
}
</style>


