import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createStore } from 'vuex'
import { raceModule } from '@/store/modules/race'
import { horsesModule } from '@/store/modules/horses'
import type { RaceRound, RaceRoundResult } from '@/types'

const mockSchedule: RaceRound[] = [
  { roundNumber: 1, distance: 1200, horseIds: [1, 2] },
  { roundNumber: 2, distance: 1400, horseIds: [3, 4] },
]

const mockResult: RaceRoundResult = {
  roundNumber: 1,
  entries: [
    { position: 1, horseId: 1, elapsedMs: 8000 },
    { position: 2, horseId: 2, elapsedMs: 9000 },
  ],
}

vi.mock('@/shared/utils/race', () => ({
  generateRaceSchedule: vi.fn(() => mockSchedule),
  simulateRoundResult: vi.fn(() => mockResult),
}))

const createStoreInstance = () =>
  createStore({
    modules: {
      horses: {
        ...horsesModule,
        state: {
          pool: [
            { id: 1, name: 'Alpha', color: '#111111', condition: 50 },
            { id: 2, name: 'Bravo', color: '#222222', condition: 70 },
            { id: 3, name: 'Charlie', color: '#333333', condition: 80 },
            { id: 4, name: 'Delta', color: '#444444', condition: 60 },
          ],
          isGenerating: false,
          seed: 123,
        },
      },
      race: {
        ...raceModule,
        state: {
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
        },
      },
    },
  })

describe('race module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(0)
  })

  it('throws when starting race without a prepared schedule', async () => {
    const store = createStoreInstance()
    store.state.race.schedule = []

    expect(() => store.dispatch('race/startRace')).toThrow(
      'Cannot start race without a prepared schedule.',
    )
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('prepares race schedule and sets status to ready', () => {
    const store = createStoreInstance()

    store.dispatch('race/prepareRace', 555)

    expect(store.state.race.status).toBe('ready')
    expect(store.state.race.schedule).toEqual(mockSchedule)
    expect(store.state.race.currentRoundIndex).toBe(0)
  })

  it('processes current round and populates preview data', () => {
    const store = createStoreInstance()
    store.dispatch('race/prepareRace', 123)
    store.commit('race/setStatus', 'running')

    store.dispatch('race/processCurrentRound')

    expect(store.state.race.currentRoundPreview).toEqual(mockResult)
    expect(store.state.race.currentRoundSegments).not.toEqual({})
    expect(store.state.race.roundStartedAt).not.toBeNull()
    expect(store.state.race.roundRemainingMs).toBeGreaterThan(0)
  })

  it('completes current round and moves to awaiting state', () => {
    const store = createStoreInstance()
    store.dispatch('race/prepareRace', 123)
    store.commit('race/setStatus', 'running')
    store.dispatch('race/processCurrentRound')

    store.dispatch('race/completeCurrentRound')

    expect(store.state.race.results).toHaveLength(1)
    expect(store.state.race.status).toBe('awaiting')
    expect(store.state.race.currentRoundSegments).toEqual({})
    expect(store.state.race.roundTimeoutId).toBeNull()
  })

  it('finishes race when last round is completed', () => {
    const store = createStoreInstance()
    store.dispatch('race/prepareRace', 123)
    store.commit('race/setStatus', 'running')
    store.commit('race/advanceRound') // move to last round
    store.dispatch('race/processCurrentRound')

    store.dispatch('race/completeCurrentRound')

    expect(store.state.race.status).toBe('finished')
    expect(store.state.race.results).toHaveLength(1)
  })

  it('marks race as finished when awaiting next round on final round', () => {
    const store = createStoreInstance()
    store.state.race.status = 'awaiting'
    store.state.race.currentRoundIndex = mockSchedule.length - 1
    store.state.race.schedule = mockSchedule

    store.dispatch('race/startNextRound')

    expect(store.state.race.status).toBe('finished')
  })

  it('pauses and resumes race preserving timing', () => {
    const store = createStoreInstance()
    store.dispatch('race/prepareRace', 123)
    store.commit('race/setStatus', 'running')
    store.dispatch('race/processCurrentRound')
    vi.advanceTimersByTime(500)
    vi.setSystemTime(500)

    store.dispatch('race/pauseRace')
    expect(store.state.race.status).toBe('paused')
    const remaining = store.state.race.roundRemainingMs
    expect(remaining).not.toBeNull()

    store.dispatch('race/resumeRace')
    expect(store.state.race.status).toBe('running')
    expect(store.state.race.roundRemainingMs).toBe(remaining)
    expect(store.state.race.roundTimeoutId).not.toBeNull()
  })
})

