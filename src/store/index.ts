import { createStore } from 'vuex'
import { horsesModule, type HorsesState } from './modules/horses'
import { raceModule, type RaceState } from './modules/race'

export interface RootState {
  version: string
  horses: HorsesState
  race: RaceState
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
  actions: {},
  modules: {
    horses: horsesModule,
    race: raceModule,
  },
})

export default store

