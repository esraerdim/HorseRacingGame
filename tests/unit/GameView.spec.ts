import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createStore, type Store } from 'vuex'
import Game from '@/pages/Game.vue'

type GameStoreOptions = {
  status?: string
}

const createGameStore = ({ status = 'idle' }: GameStoreOptions = {}) => {
  const store = createStore({
    state: () => ({}),
    modules: {
      horses: {
        namespaced: true,
        state: () => ({
          pool: [],
          isGenerating: false,
        }),
        actions: {
          generatePool: vi.fn(),
        },
      },
      race: {
        namespaced: true,
        state: () => ({
          status,
          schedule: [],
          results: [],
        }),
      },
    },
  }) as Store<unknown>

  return { store }
}

const createStub = (className: string) => ({
  template: `<div class="${className}"></div>`,
})

describe('Game', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('disables live results toggle when race status is idle', async () => {
    const { store } = createGameStore({ status: 'idle' })
    const wrapper = mount(Game, {
      global: {
        plugins: [store],
        stubs: {
          DefaultLayout: {
            template: '<div><slot name="header" /><slot /></div>',
          },
          HorseListPanel: createStub('horse-list-stub'),
          ControlsPanel: createStub('controls-stub'),
          ProgramResultsPanel: createStub('program-results-stub'),
          LiveBoardPanel: createStub('live-board-stub'),
          RaceTrack: createStub('race-track-stub'),
        },
      },
    })
    await flushPromises()

    const toggle = wrapper.get('.game-page__toggle')
    expect(toggle.attributes('disabled')).toBeDefined()

    const liveBoard = wrapper.find('.live-board-stub')
    expect(liveBoard.exists()).toBe(false)
  })

  it('automatically shows live results when race starts running', async () => {
    const { store } = createGameStore({ status: 'running' })
    const wrapper = mount(Game, {
      global: {
        plugins: [store],
        stubs: {
          DefaultLayout: {
            template: '<div><slot name="header" /><slot /></div>',
          },
          HorseListPanel: createStub('horse-list-stub'),
          ControlsPanel: createStub('controls-stub'),
          ProgramResultsPanel: createStub('program-results-stub'),
          LiveBoardPanel: createStub('live-board-stub'),
          RaceTrack: createStub('race-track-stub'),
        },
      },
    })
    await flushPromises()

    const liveBoard = wrapper.find('.live-board-stub')
    expect(liveBoard.exists()).toBe(true)
  })

  it('toggles live results visibility when button is clicked', async () => {
    const { store } = createGameStore({ status: 'ready' })
    const wrapper = mount(Game, {
      global: {
        plugins: [store],
        stubs: {
          DefaultLayout: {
            template: '<div><slot name="header" /><slot /></div>',
          },
          HorseListPanel: createStub('horse-list-stub'),
          ControlsPanel: createStub('controls-stub'),
          ProgramResultsPanel: createStub('program-results-stub'),
          LiveBoardPanel: createStub('live-board-stub'),
          RaceTrack: createStub('race-track-stub'),
        },
      },
    })
    await flushPromises()

    const toggle = wrapper.get('.game-page__toggle')
    expect(toggle.attributes('disabled')).toBeUndefined()

    const liveBoard = wrapper.find('.live-board-stub')
    expect(liveBoard.exists()).toBe(false)

    await toggle.trigger('click')
    await flushPromises()
    expect(wrapper.find('.live-board-stub').exists()).toBe(true)

    await toggle.trigger('click')
    await flushPromises()
    expect(wrapper.find('.live-board-stub').exists()).toBe(false)
  })
})

