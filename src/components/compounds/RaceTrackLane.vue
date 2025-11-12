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
  gap: 0.75rem;
  padding: 0.15rem 0.6rem 0.15rem 0.38rem;
  position: relative;
}

.race-track-lane__number {
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  width: 2rem;
}

.race-track-lane__track {
  position: relative;
  height: 100%;
  min-height: 2.3rem;
  flex: 1;
  padding: 0 1.9rem 0.06rem 1.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px dashed rgba(148, 163, 184, 0.45);
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


