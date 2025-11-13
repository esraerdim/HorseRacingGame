<script lang="ts">
import {
  defineAsyncComponent,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  computed,
} from 'vue'
import { useStore } from 'vuex'
import type { RootState } from '@/store'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AppButton from '@/components/base/AppButton.vue'

const HorseListPanel = defineAsyncComponent(
  () => import('@/components/sections/HorseListPanel.vue'),
)
const ControlsPanel = defineAsyncComponent(
  () => import('@/components/sections/Controls.vue'),
)
const ProgramResultsPanel = defineAsyncComponent(
  () => import('@/components/sections/ProgramResultsPanel.vue'),
)
const LiveBoardPanel = defineAsyncComponent(
  () => import('@/components/sections/LiveBoardPanel.vue'),
)
const RaceTrack = defineAsyncComponent(
  () => import('@/components/sections/RaceTrack.vue'),
)
export default defineComponent({
  name: 'Game',
  components: {
    DefaultLayout,
    AppButton,
    HorseListPanel,
    ControlsPanel,
    ProgramResultsPanel,
    LiveBoardPanel,
    RaceTrack,
  },
  setup() {
    const store = useStore<RootState>()
    const liveBoardVisible = ref(false)
    const isMobile = ref(false)

    const updateIsMobile = () => {
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        isMobile.value = false
        return
      }
      isMobile.value = window.matchMedia('(max-width: 768px)').matches
    }

    watch(
      () => store.state.race.status,
      (status) => {
        if (status === 'idle') {
          liveBoardVisible.value = false
        }
        if (status === 'running') {
          liveBoardVisible.value = true
        }
        if (status === 'countdown') {
          liveBoardVisible.value = true
        }
        if (status === 'finished') {
          liveBoardVisible.value = false
        }
      },
      { immediate: true },
    )

    const showLiveBoard = computed(() => !isMobile.value && liveBoardVisible.value)

    onMounted(() => {
      updateIsMobile()
      if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
        window.addEventListener('resize', updateIsMobile, { passive: true })
      }
      if (!store.state.horses.pool.length) {
        store.dispatch('horses/generatePool')
      }
    })

    onBeforeUnmount(() => {
      if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
        window.removeEventListener('resize', updateIsMobile)
      }
    })

    return {
      store,
      liveBoardVisible,
      isMobile,
      showLiveBoard,
    }
  },
})
</script>

<template>
  <DefaultLayout>
    <template #header>
      <header class="game-page__header">
        <h1 class="game-page__title">Horse Racing Game</h1>
        <div class="game-page__header-actions">
          <ControlsPanel class="game-page__controls" />
          <AppButton
            v-if="!isMobile"
            size="xs"
            class="game-page__toggle"
            @click="liveBoardVisible = !liveBoardVisible"
            :disabled="store.state.race.status === 'idle'"
          >
            <span v-if="liveBoardVisible">Hide Live Results</span>
            <span v-else>Show Live Results</span>
          </AppButton>
        </div>
      </header>
    </template>

    <section class="game-page__content">
      <aside class="game-page__column game-page__column--left">
        <HorseListPanel />
      </aside>

      <section class="game-page__column game-page__column--center">
        <RaceTrack class="game-page__track" />
      </section>

      <aside class="game-page__column game-page__column--right">
        <LiveBoardPanel v-if="showLiveBoard" />
        <ProgramResultsPanel />
      </aside>
    </section>
  </DefaultLayout>
</template>

<style scoped>
.game-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
  background: var(--color-surface-strong);
  border-radius: var(--radius-md);
  padding: 0.4rem 0.75rem;
  margin: 0.1rem 0;
  box-shadow: var(--shadow-md);
}

.game-page__title {
  font-size: clamp(1.1rem, 1.4vw, 1.35rem);
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  letter-spacing: -0.01em;
}

.game-page__header-actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.game-page__header-actions > * {
  flex: 0 0 auto;
}

.game-page__controls {
  display: flex;
}

.game-page__toggle {
  appearance: none;
  border: 1px solid rgba(148, 163, 184, 0.24);
  background: rgba(255, 255, 255, 0.95);
  color: #312e81;
  border-radius: var(--radius-sm);
  padding: 0.32rem 0.7rem;
  font-weight: 600;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background 0.2s ease, box-shadow 0.2s ease;
  min-width: 7.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.game-page__toggle:hover:enabled {
  background: rgba(79, 70, 229, 0.08);
  box-shadow: 0 6px 12px rgba(79, 70, 229, 0.12);
}

.game-page__toggle:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.game-page__content {
  display: grid;
  grid-template-columns: 1fr 2.4fr 1.1fr;
  gap: 1rem;
  flex: 1;
  min-height: 0;
  height: 100%;
}

.game-page__column {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  min-height: 0;
  height: 100%;
}

.game-page__column--left {
  overflow: auto;
  padding-right: 0.2rem;
}

.game-page__column--right {
  overflow: visible;
}

.game-page__track {
  flex: 1;
  min-height: 0;
}

@media (max-width: 1024px) {
  .game-page__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.45rem 0.3rem;
  }

  .game-page__header-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .game-page__content {
    grid-template-columns: 1fr;
    overflow: visible;
  }

  .game-page__column {
    width: 100%;
    overflow: visible;
  }

  .game-page__column + .game-page__column {
    margin-top: 1rem;
  }
}
</style>


