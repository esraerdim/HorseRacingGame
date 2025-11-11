import type { Module } from 'vuex'
import type { RootState } from '../index'
import type { Horse } from '@/types'
import {
  CONDITION_RANGE,
  HORSE_NAMES,
  TOTAL_HORSES,
} from '@/config/race-config'
import { SeededRandom, DEFAULT_SEED } from '@/utils/random'
import { generateVisuallyDistinctPalette } from '@/utils/colors'

export interface HorsesState {
  pool: Horse[]
  isGenerating: boolean
  seed: number
}

const state: HorsesState = {
  pool: [],
  isGenerating: false,
  seed: DEFAULT_SEED,
}

export const horsesModule: Module<HorsesState, RootState> = {
  namespaced: true,
  state,
  getters: {
    horsePool: (moduleState) => moduleState.pool,
    horseCount: (moduleState) => moduleState.pool.length,
    generationSeed: (moduleState) => moduleState.seed,
    isGenerating: (moduleState) => moduleState.isGenerating,
  },
  mutations: {
    setPool(moduleState, horses: Horse[]) {
      moduleState.pool = horses
    },
    setGenerating(moduleState, value: boolean) {
      moduleState.isGenerating = value
    },
    setSeed(moduleState, seed: number) {
      moduleState.seed = seed
    },
    reset(moduleState) {
      moduleState.pool = []
      moduleState.isGenerating = false
      moduleState.seed = DEFAULT_SEED
    },
  },
  actions: {
    async generatePool({ commit }, seed: number | undefined) {
      commit('setGenerating', true)
      try {
        const resolvedSeed = seed ?? Date.now()
        const rng = new SeededRandom(resolvedSeed)
    
        const colors = generateVisuallyDistinctPalette(TOTAL_HORSES, resolvedSeed)
    
        for (let i = colors.length - 1; i > 0; i--) {
          const j = rng.nextInt(0, i)
          ;[colors[i]!, colors[j]!] = [colors[j]!, colors[i]!]
        }
    
        const namePool: string[] =
          HORSE_NAMES.length >= TOTAL_HORSES
            ? [...HORSE_NAMES]
            : [
                ...HORSE_NAMES,
                ...Array.from(
                  { length: TOTAL_HORSES - HORSE_NAMES.length },
                  (_, idx) => `Horse ${HORSE_NAMES.length + idx + 1}`,
                ),
              ]
    
        const horses: Horse[] = namePool.slice(0, TOTAL_HORSES).map(
          (name, index) => ({
            id: index + 1,
            name,
            color: colors[index]!,
            condition: rng.nextInt(CONDITION_RANGE.min, CONDITION_RANGE.max),
          }),
        )
    
        commit('setPool', horses)
        commit('setSeed', resolvedSeed)
        return horses
      } finally {
        commit('setGenerating', false)
      }
    }
    
  },
}

