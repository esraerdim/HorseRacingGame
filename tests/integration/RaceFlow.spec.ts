import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createStore, type Store } from 'vuex'
import Controls from '@/components/sections/Controls.vue'
import { horsesModule, type HorsesState } from '@/store/modules/horses'
import { raceModule, type RaceState } from '@/store/modules/race'
import { DEFAULT_SEED } from '@/shared/utils/random'

type RootStateShape = {
  version: string
  horses: HorsesState
  race: RaceState
}

const createRootStore = (): Store<RootStateShape> =>
  createStore<RootStateShape>({
    state: () =>
      ({
        version: '0.1.0',
      }) as RootStateShape,
    getters: {
      appVersion: (state) => state.version,
    },
    mutations: {
      setVersion(state, payload: string) {
        state.version = payload
      },
    },
    actions: {
      async generateRaceProgram({ dispatch, rootState }) {
        const shouldGenerateHorses = rootState.horses.pool.length === 0

        if (shouldGenerateHorses) {
          await dispatch('horses/generatePool', DEFAULT_SEED, { root: true })
        }

        await dispatch('race/prepareRace', DEFAULT_SEED, { root: true })
      },
    },
    modules: {
      horses: {
        ...horsesModule,
        state: () => ({
          pool: [],
          isGenerating: false,
          seed: DEFAULT_SEED,
        }),
      },
      race: {
        ...raceModule,
        state: () =>
          ({
            status: 'idle',
            currentRoundIndex: 0,
            schedule: [],
            results: [],
            isPaused: false,
            roundTimeoutId: null,
            roundStartedAt: null,
            roundDurationMs: 3500,
            roundRemainingMs: null,
            roundCompletedMs: 0,
            currentRoundPreview: null,
            currentRoundSegments: {},
          }) as RaceState,
      },
    },
  })

describe('Race flow integration', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('runs an entire race through generate, start, and completion', async () => {
    const store = createRootStore()
    const wrapper = mount(Controls, {
      global: {
        plugins: [store],
      },
    })

    const buttons = () => wrapper.findAll('button')
    const generateButton = () => buttons()[0]!
    const flowButton = () => buttons()[1]!

    await generateButton().trigger('click')
    await flushPromises()

    expect(store.state.horses.pool.length).toBeGreaterThan(0)
    expect(store.state.race.schedule.length).toBeGreaterThan(0)
    expect(store.state.race.status).toBe('ready')

    const totalRounds = store.state.race.schedule.length

    for (let round = 0; round < totalRounds; round += 1) {
      await flowButton().trigger('click') // Start, Pause/Resume/Next Lap depending on state
      await flushPromises()

      if (round === 0) {
        expect(store.state.race.status).toBe('running')
      }

      vi.runOnlyPendingTimers()
      await flushPromises()

      if (round < totalRounds - 1) {
        expect(store.state.race.status).toBe('awaiting')
      }
    }

    // complete final pending timers to finish race
    vi.runAllTimers()
    await flushPromises()

    expect(store.state.race.status).toBe('finished')
    expect(store.state.race.results.length).toBe(totalRounds)
  })
})

