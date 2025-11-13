import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createStore } from 'vuex'
import { horsesModule } from '@/store/modules/horses'
import { TOTAL_HORSES } from '@/shared/config/race'
import { DEFAULT_SEED } from '@/shared/utils/random'
import { generateVisuallyDistinctPalette } from '@/shared/utils/colors'

vi.mock('@/shared/utils/colors', () => ({
  generateVisuallyDistinctPalette: vi.fn((count: number) =>
    Array.from({ length: count }, (_, index) => `#color-${index}`),
  ),
}))

const createHorsesModule = () => ({
  ...horsesModule,
  state: {
    pool: [],
    isGenerating: false,
    seed: DEFAULT_SEED,
  },
})

describe('horses module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('generates a horse pool with provided seed', async () => {
    const store = createStore({
      modules: {
        horses: createHorsesModule(),
      },
    })

    await store.dispatch('horses/generatePool', 42)

    const state = store.state.horses
    expect(state.pool).toHaveLength(TOTAL_HORSES)
    expect(state.seed).toBe(42)
    expect(state.isGenerating).toBe(false)
    expect(state.pool[0]?.id).toBe(1)
    expect(state.pool[0]?.color).toMatch(/^#color-/)
    state.pool.forEach((horse) => {
      expect(horse.id).toBeGreaterThan(0)
      expect(horse.condition).toBeGreaterThanOrEqual(1)
      expect(horse.condition).toBeLessThanOrEqual(100)
    })
  })

  it('resets generating flag when palette generation fails', async () => {
    const store = createStore({
      modules: {
        horses: createHorsesModule(),
      },
    })

    const paletteMock = vi.mocked(generateVisuallyDistinctPalette)
    paletteMock.mockImplementationOnce(() => {
      throw new Error('boom')
    })

    await expect(store.dispatch('horses/generatePool', 77)).rejects.toThrow('boom')

    const state = store.state.horses
    expect(state.isGenerating).toBe(false)
    expect(state.pool).toHaveLength(0)
    expect(state.seed).toBe(DEFAULT_SEED)
  })
})

