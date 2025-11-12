import { createStore } from 'vuex'
import { horsesModule, type HorsesState } from './modules/horses'
import { raceModule, type RaceState } from './modules/race'

export interface RootState {
  version: string
  horses: HorsesState
  race: RaceState
}

interface GenerateRaceProgramPayload {
  scheduleSeed?: number
  regenerateHorses?: boolean
  horseSeed?: number
}

export const store = createStore<RootState>({
  state: () =>
    ({
      version: '0.1.0',
    } as RootState),
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
      { dispatch, rootState },
      payload: GenerateRaceProgramPayload = {},
    ) {
      const shouldGenerateHorses =
        payload.regenerateHorses === true || rootState.horses.pool.length === 0

      if (shouldGenerateHorses) {
        const horseSeed = payload.horseSeed ?? Date.now()
        await dispatch('horses/generatePool', horseSeed, { root: true })
      }

      const scheduleSeed = payload.scheduleSeed ?? Date.now()
      await dispatch('race/prepareRace', scheduleSeed, { root: true })
    },
  },
  modules: {
    horses: horsesModule,
    race: raceModule,
  },
})

export default store

