import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createStore, type Store } from 'vuex'
import Controls from '@/components/sections/Controls.vue'

type ControlsStoreOptions = {
  isGenerating?: boolean
  status?: string
  scheduleLength?: number
}

const createControlsStore = ({
  isGenerating = false,
  status = 'idle',
  scheduleLength = 0,
}: ControlsStoreOptions = {}) => {
  const generateRaceProgram = vi.fn().mockResolvedValue(undefined)
  const pauseRace = vi.fn()
  const resumeRace = vi.fn()
  const startRace = vi.fn()
  const startNextRound = vi.fn()

  const store = createStore({
    state: () => ({}),
    getters: {
      'horses/isGenerating': () => isGenerating,
    },
    actions: {
      generateRaceProgram,
    },
    modules: {
      horses: {
        namespaced: true,
        state: () => ({
          isGenerating,
          pool: [],
        }),
      },
      race: {
        namespaced: true,
        state: () => ({
          status,
          schedule: Array.from({ length: scheduleLength }, (_, index) => ({
            roundNumber: index + 1,
            distance: 1200,
            horseIds: [],
          })),
          roundCountdownMs: null,
          roundCountdownTotalMs: null,
        }),
        actions: {
          pauseRace,
          resumeRace,
          startRace,
          startNextRound,
        },
      },
    },
  }) as Store<unknown>

  return {
    store,
    actions: {
      generateRaceProgram,
      pauseRace,
      resumeRace,
      startRace,
      startNextRound,
    },
  }
}

describe('Controls', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('disables generate button while generating', async () => {
    const { store } = createControlsStore({ isGenerating: true })
    const wrapper = mount(Controls, {
      global: {
        plugins: [store],
      },
    })

    const buttons = wrapper.findAll('button')
    expect(buttons[0]?.attributes('disabled')).toBeDefined()
    expect(buttons[0]?.text()).toContain('Generating…')
  })

  it('dispatches generateRaceProgram when generate is clicked', async () => {
    const { store, actions } = createControlsStore({ scheduleLength: 1 })
    const wrapper = mount(Controls, {
      global: {
        plugins: [store],
      },
    })

    const buttons = wrapper.findAll('button')
    await buttons[0]!.trigger('click')
    await flushPromises()

    expect(actions.generateRaceProgram).toHaveBeenCalledTimes(1)
  })

  it('shows Pause label and pauses when race is running', async () => {
    const { store, actions } = createControlsStore({
      status: 'running',
      scheduleLength: 1,
    })
    const wrapper = mount(Controls, {
      global: {
        plugins: [store],
      },
    })

    const startButton = wrapper.findAll('button')[1]!
    expect(startButton.text()).toBe('Pause')
    await startButton.trigger('click')
    expect(actions.pauseRace).toHaveBeenCalledTimes(1)
  })

  it('shows Resume label and resumes when race is paused', async () => {
    const { store, actions } = createControlsStore({
      status: 'paused',
      scheduleLength: 1,
    })
    const wrapper = mount(Controls, {
      global: {
        plugins: [store],
      },
    })

    const startButton = wrapper.findAll('button')[1]!
    expect(startButton.text()).toBe('Resume')
    await startButton.trigger('click')
    expect(actions.resumeRace).toHaveBeenCalledTimes(1)
  })

  it('allows skipping countdown when status is countdown', async () => {
    const { store, actions } = createControlsStore({
      status: 'countdown',
      scheduleLength: 2,
    })
    const wrapper = mount(Controls, {
      global: {
        plugins: [store],
      },
    })

    const startButton = wrapper.findAll('button')[1]!
    expect(startButton.text()).toBe('Skip Countdown')
    await startButton.trigger('click')
    expect(actions.startNextRound).toHaveBeenCalledTimes(1)
  })

  it('disables start button if no schedule is available', () => {
    const { store } = createControlsStore({
      status: 'ready',
      scheduleLength: 0,
    })
    const wrapper = mount(Controls, {
      global: {
        plugins: [store],
      },
    })

    const startButton = wrapper.findAll('button')[1]!
    expect(startButton.attributes('disabled')).toBeDefined()
  })
})

