import { createStore } from 'vuex'

export interface RootState {
  version: string
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
  modules: {},
})

export default store

