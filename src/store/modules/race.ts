import type { Module } from 'vuex'
import type { RootState } from '../index'
import type { RaceRound, RaceRoundResult, RaceStatus } from '@/types'
import { generateRaceSchedule, simulateRoundResult } from '@/utils/race'

export interface RaceState {
  status: RaceStatus
  currentRoundIndex: number
  schedule: RaceRound[]
  results: RaceRoundResult[]
}

const initialState: RaceState = {
  status: 'idle',
  currentRoundIndex: 0,
  schedule: [],
  results: [],
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
    },
    advanceRound(state) {
      state.currentRoundIndex += 1
    },
    appendResult(state, result: RaceRoundResult) {
      state.results = [...state.results, result]
    },
    reset(state) {
      state.status = 'idle'
      state.currentRoundIndex = 0
      state.schedule = []
      state.results = []
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

