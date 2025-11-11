import { createStore } from 'vuex'
import { horsesModule, type HorsesState } from './modules/horses'
import { raceModule, type RaceState } from './modules/race'

export interface RootState {
  version: string
  horses: HorsesState
  race: RaceState
}

interface GenerateRaceProgramPayload {
  seed?: number
}

export const store = createStore<RootState>({
  state: {
    version: '0.1.0',
  },
  getters: {
    appVersion: (state: RootState) => state.version,
  },
  mutations: {
    setVersion(state: RootState, payload: string) {
      state.version = payload
    },
  },
  actions: {
    async generateRaceProgram(
      { dispatch },
      payload: GenerateRaceProgramPayload = {},
    ) {
      const generationSeed = payload.seed ?? Date.now()

      await dispatch('horses/generatePool', generationSeed, { root: true })
      await dispatch('race/prepareRace', generationSeed, { root: true })
    },
  },
  modules: {
    horses: horsesModule,
    race: raceModule,
  },
})

export default store

