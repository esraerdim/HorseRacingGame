import type { Module } from 'vuex'
import type { RootState } from '../index'
import type { RaceRound, RaceRoundResult, RaceStatus } from '@/types'
import { generateRaceSchedule, simulateRoundResult } from '@/utils/race'
import { SeededRandom } from '@/utils/random'

const ROUND_MIN_DURATION_MS = 3500
const SEGMENT_COUNT = 4

const buildSegments = (
  entry: RaceRoundResult['entries'][number],
  distance: number,
  rng: SeededRandom,
): number[] => {
  const totalTimeSec = entry.elapsedMs / 1000
  if (totalTimeSec <= 0) {
    return Array.from({ length: SEGMENT_COUNT }, (_, idx) => (idx + 1) * (entry.elapsedMs / SEGMENT_COUNT))
  }
  const baseSpeed = distance / totalTimeSec
  const segmentDistance = distance / SEGMENT_COUNT
  const multipliers = Array.from({ length: SEGMENT_COUNT }, () => 0.7 + rng.next() * 0.6)
  let segmentTimes = multipliers.map(
    (multiplier) => segmentDistance / Math.max(baseSpeed * multiplier, 0.1),
  )
  const scaleFactor = totalTimeSec / segmentTimes.reduce((acc, value) => acc + value, 0)
  segmentTimes = segmentTimes.map((time) => time * scaleFactor)
  let cumulative = 0
  const cumulativeMs = segmentTimes.map((time, index) => {
    cumulative += time * 1000
    if (index === SEGMENT_COUNT - 1) {
      return entry.elapsedMs
    }
    return cumulative
  })
  return cumulativeMs
}

export interface RaceState {
  status: RaceStatus
  currentRoundIndex: number
  schedule: RaceRound[]
  results: RaceRoundResult[]
  isPaused: boolean
  roundTimeoutId: number | null
  roundStartedAt: number | null
  roundDurationMs: number
  roundRemainingMs: number | null
  roundCompletedMs: number
  currentRoundPreview: RaceRoundResult | null
  currentRoundSegments: Record<number, number[]>
}

const initialState: RaceState = {
  status: 'idle',
  currentRoundIndex: 0,
  schedule: [],
  results: [],
  isPaused: false,
  roundTimeoutId: null,
  roundStartedAt: null,
  roundDurationMs: ROUND_MIN_DURATION_MS,
  roundRemainingMs: null,
  roundCompletedMs: 0,
  currentRoundPreview: null,
  currentRoundSegments: {},
}

export const raceModule: Module<RaceState, RootState> = {
  namespaced: true,
  state: { ...initialState },
  getters: {
    activeRound(state) {
      return state.schedule[state.currentRoundIndex] ?? null
    },
    isRaceFinished(state) {
      return state.status === 'finished'
    },
  },
  mutations: {
    setStatus(state, status: RaceStatus) {
      state.status = status
    },
    setSchedule(state, schedule: RaceRound[]) {
      state.schedule = schedule
      state.currentRoundIndex = 0
      state.results = []
    },
    advanceRound(state) {
      state.currentRoundIndex += 1
    },
    appendResult(state, result: RaceRoundResult) {
      state.results = [...state.results, result]
    },
    setPause(state, value: boolean) {
      state.isPaused = value
    },
    setRoundTimeout(state, timeoutId: number | null) {
      state.roundTimeoutId = timeoutId
    },
    setRoundTiming(
      state,
      payload: {
        startedAt: number | null
        durationMs?: number
        remainingMs?: number | null
        completedMs?: number
      },
    ) {
      state.roundStartedAt = payload.startedAt
      if (typeof payload.durationMs === 'number') {
        state.roundDurationMs = payload.durationMs
      }
      if (typeof payload.remainingMs === 'number' || payload.remainingMs === null) {
        state.roundRemainingMs = payload.remainingMs
      }
      if (typeof payload.completedMs === 'number') {
        state.roundCompletedMs = payload.completedMs
      }
    },
    setCurrentRoundPreview(state, preview: RaceRoundResult | null) {
      state.currentRoundPreview = preview
    },
    setCurrentRoundSegments(state, segments: Record<number, number[]>) {
      state.currentRoundSegments = segments
    },
    reset(state) {
      state.status = 'idle'
      state.currentRoundIndex = 0
      state.schedule = []
      state.results = []
      state.isPaused = false
      if (state.roundTimeoutId !== null) {
        clearTimeout(state.roundTimeoutId)
      }
      state.roundTimeoutId = null
      state.roundStartedAt = null
      state.roundRemainingMs = null
      state.roundCompletedMs = 0
      state.currentRoundPreview = null
      state.currentRoundSegments = {}
    },
  },
  actions: {
    prepareRace({ commit, rootState }, seed?: number) {
      const horses = rootState.horses.pool
      if (!horses.length) {
        throw new Error('Cannot prepare race without a generated horse pool.')
      }
      const resolvedSeed = seed ?? rootState.horses.seed
      const schedule = generateRaceSchedule({
        horses,
        seed: resolvedSeed,
      })
      commit('reset')
      commit('setSchedule', schedule)
      commit('setStatus', 'ready')
    },
    startRace({ dispatch, commit, state }) {
      if (!state.schedule.length) {
        throw new Error('Cannot start race without a prepared schedule.')
      }
      if (state.status === 'running') return
      if (state.status === 'awaiting') {
        dispatch('startNextRound')
        return
      }
      commit('setStatus', 'running')
      commit('setPause', false)
      dispatch('processCurrentRound')
    },
    startNextRound({ dispatch, commit, state }) {
      if (state.status !== 'awaiting') return
      if (state.currentRoundIndex >= state.schedule.length - 1) {
        commit('setStatus', 'finished')
        return
      }
      commit('advanceRound')
      if (state.currentRoundIndex >= state.schedule.length) {
        commit('setStatus', 'finished')
        return
      }
      commit('setCurrentRoundPreview', null)
      commit('setRoundTiming', {
        startedAt: null,
        remainingMs: null,
        completedMs: 0,
      })
      commit('setStatus', 'running')
      commit('setPause', false)
      dispatch('processCurrentRound')
    },
    processCurrentRound({ state, commit, dispatch, rootState }) {
      if (state.isPaused || state.status !== 'running') {
        return
      }
      const currentRound = state.schedule[state.currentRoundIndex]
      if (!currentRound) {
        commit('setStatus', 'finished')
        commit('setRoundTimeout', null)
        commit('setRoundTiming', { startedAt: null, remainingMs: null, completedMs: 0 })
        commit('setCurrentRoundPreview', null)
        commit('setCurrentRoundSegments', {})
        return
      }

      const previewResult = simulateRoundResult({
        assignment: currentRound,
        horses: rootState.horses.pool,
        seed: rootState.horses.seed + currentRound.roundNumber,
      })
      commit('setCurrentRoundPreview', previewResult)

      const rng = new SeededRandom(
        rootState.horses.seed + currentRound.roundNumber * 97 + state.currentRoundIndex,
      )
      const segmentsMap = previewResult.entries.reduce<Record<number, number[]>>(
        (acc, entry) => {
          acc[entry.horseId] = buildSegments(entry, currentRound.distance, rng)
          return acc
        },
        {},
      )
      commit('setCurrentRoundSegments', segmentsMap)

      const maxElapsed = Math.max(...previewResult.entries.map((e) => e.elapsedMs))
      const duration = Math.max(maxElapsed, ROUND_MIN_DURATION_MS)

      commit('setRoundTiming', {
        startedAt: Date.now(),
        durationMs: duration,
        remainingMs: duration,
        completedMs: 0,
      })

      const timeoutId = window.setTimeout(() => {
        dispatch('completeCurrentRound')
      }, duration)
      commit('setRoundTimeout', timeoutId)
    },
    completeCurrentRound({ state, commit, rootState }) {
      const currentRound = state.schedule[state.currentRoundIndex]
      if (!currentRound) {
        commit('setStatus', 'finished')
        commit('setRoundTimeout', null)
        commit('setRoundTiming', { startedAt: null, remainingMs: null, completedMs: 0 })
        commit('setCurrentRoundPreview', null)
        commit('setCurrentRoundSegments', {})
        return
      }

      const preview =
        state.currentRoundPreview ??
        simulateRoundResult({
          assignment: currentRound,
          horses: rootState.horses.pool,
          seed: rootState.horses.seed + currentRound.roundNumber,
        })

      commit('appendResult', preview)
      commit('setCurrentRoundSegments', {})
      commit('setRoundTiming', {
        startedAt: null,
        remainingMs: null,
        completedMs: state.roundDurationMs,
      })
      commit('setRoundTimeout', null)
      commit('setPause', false)

      const isLastRound = state.currentRoundIndex >= state.schedule.length - 1
      if (isLastRound) {
        commit('setStatus', 'finished')
        return
      }

      commit('setStatus', 'awaiting')
    },
    pauseRace({ commit, state }) {
      if (state.status !== 'running') return
      commit('setPause', true)
      commit('setStatus', 'paused')
      if (state.roundTimeoutId !== null) {
        clearTimeout(state.roundTimeoutId)
        commit('setRoundTimeout', null)
      }
      if (state.roundStartedAt) {
        const elapsed = Date.now() - state.roundStartedAt
        const priorCompleted = state.roundCompletedMs || 0
        const completed = Math.min(
          state.roundDurationMs,
          priorCompleted + elapsed,
        )
        const remaining = Math.max(0, state.roundDurationMs - completed)
        commit('setRoundTiming', {
          startedAt: null,
          remainingMs: remaining,
          completedMs: completed,
        })
      }
    },
    resumeRace({ commit, dispatch, state }) {
      if (state.status !== 'paused') return
      const remaining = state.roundRemainingMs ?? state.roundDurationMs
      if (remaining <= 0) {
        commit('setStatus', 'running')
        commit('setPause', false)
        dispatch('completeCurrentRound')
        return
      }
      commit('setStatus', 'running')
      commit('setPause', false)
      commit('setRoundTiming', {
        startedAt: Date.now(),
        durationMs: state.roundDurationMs,
        remainingMs: remaining,
        completedMs: state.roundDurationMs - remaining,
      })
      const timeoutId = window.setTimeout(() => {
        dispatch('completeCurrentRound')
      }, remaining)
      commit('setRoundTimeout', timeoutId)
    },
    resetRace({ commit }) {
      commit('reset')
    },
    recordRoundResult({ commit, rootState }, assignment: RaceRound) {
      const horses = rootState.horses.pool
      const seed = rootState.horses.seed + assignment.roundNumber
      const result = simulateRoundResult({
        assignment,
        horses,
        seed,
      })
      commit('appendResult', result)
    },
  },
}

