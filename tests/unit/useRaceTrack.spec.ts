import { defineComponent, nextTick, ref, type Ref } from 'vue'
import { describe, it, expect, beforeEach, afterEach, afterAll, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { useRaceTrack } from '@/shared/hooks/useRaceTrack'
import { useRaceState } from '@/shared/hooks/useRaceState'
import type { RaceRound, RaceRoundResult, RaceStatus } from '@/types'

vi.mock('@/assets/horse-running.mp3', () => ({
  default: 'horse-running.mp3',
}))

type RaceStateMock = {
  status: Ref<RaceStatus>
  schedule: Ref<RaceRound[]>
  currentRoundIndex: Ref<number>
  results: Ref<RaceRoundResult[]>
  previewResult: Ref<RaceRoundResult | null>
  roundSegments: Ref<Record<number, number[]>>
  roundStartedAt: Ref<number | null>
  roundDuration: Ref<number | null>
  roundRemaining: Ref<number | null>
  roundCompleted: Ref<number | null>
  horseLookup: Ref<Map<number, { id: number; name: string; color: string }>>
}

const createRaceState = (): RaceStateMock => ({
  status: ref<RaceStatus>('idle'),
  schedule: ref<RaceRound[]>([]),
  currentRoundIndex: ref(0),
  results: ref<RaceRoundResult[]>([]),
  previewResult: ref<RaceRoundResult | null>(null),
  roundSegments: ref<Record<number, number[]>>({}),
  roundStartedAt: ref<number | null>(null),
  roundDuration: ref<number | null>(null),
  roundRemaining: ref<number | null>(null),
  roundCompleted: ref<number | null>(null),
  horseLookup: ref(new Map()),
})

const audioPlayMock = vi.fn().mockResolvedValue(undefined)
const audioPauseMock = vi.fn()

class AudioStub {
  loop = false
  volume = 1
  currentTime = 0
  play = audioPlayMock
  pause = audioPauseMock
}

const rafMock = vi.fn(() => 1)
const cafMock = vi.fn()

vi.stubGlobal('Audio', AudioStub as unknown as typeof Audio)
vi.stubGlobal('requestAnimationFrame', rafMock)
vi.stubGlobal('cancelAnimationFrame', cafMock)

vi.mock('@/shared/hooks/useRaceState')

const mockedUseRaceState = vi.mocked(useRaceState)

const mountComposable = (state: RaceStateMock) => {
  mockedUseRaceState.mockReturnValue(state as never)

  let composable: ReturnType<typeof useRaceTrack> | undefined
  const TestComponent = defineComponent({
    setup() {
      composable = useRaceTrack()
      return () => null
    },
  })

  const wrapper = mount(TestComponent)
  return {
    wrapper,
    composable: composable!,
  }
}

describe('useRaceTrack', () => {
  let state: RaceStateMock
  let wrapper: VueWrapper | null = null

  beforeEach(() => {
    state = createRaceState()
    mockedUseRaceState.mockReturnValue(state as never)
    rafMock.mockClear()
    cafMock.mockClear()
    audioPlayMock.mockClear()
    audioPauseMock.mockClear()
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
  })

  afterAll(() => {
    vi.unstubAllGlobals()
  })

  it('formats lap labels with correct ordinal suffix', () => {
    const mounted = mountComposable(state)
    wrapper = mounted.wrapper

    expect(mounted.composable.formatLap(1)).toBe('1st Lap')
    expect(mounted.composable.formatLap(2)).toBe('2nd Lap')
    expect(mounted.composable.formatLap(3)).toBe('3rd Lap')
    expect(mounted.composable.formatLap(4)).toBe('4th Lap')
    expect(mounted.composable.formatLap(13)).toBe('13th Lap')
  })

  it('returns active round from current index', () => {
    state.schedule.value = [
      { roundNumber: 1, distance: 1200, horseIds: [1, 2] },
      { roundNumber: 2, distance: 1400, horseIds: [3, 4] },
    ]
    state.currentRoundIndex.value = 1

    const mounted = mountComposable(state)
    wrapper = mounted.wrapper

    expect(mounted.composable.activeRound.value?.roundNumber).toBe(2)
  })

  it('returns idle runners when preview is unavailable', () => {
    state.status.value = 'idle'
    state.schedule.value = [{ roundNumber: 1, distance: 1200, horseIds: [1, 2] }]
    state.horseLookup.value = new Map([
      [1, { id: 1, name: 'Velvet Vixen', color: '#ff00aa' }],
      [2, { id: 2, name: 'Sunset Sparkle', color: '#00ffaa' }],
    ])

    const mounted = mountComposable(state)
    wrapper = mounted.wrapper

    const runners = mounted.composable.runners.value
    expect(runners).toHaveLength(2)
    expect(runners[0]).toMatchObject({
      id: 1,
      name: 'Velvet Vixen',
      trackProgress: 0,
      finished: false,
      timeLabel: 'Ready',
    })
  })

  it('maps finished results to runners when race is finished', () => {
    state.schedule.value = [{ roundNumber: 1, distance: 1200, horseIds: [1, 2] }]
    state.status.value = 'finished'
    state.results.value = [
      {
        roundNumber: 1,
        entries: [
          { position: 1, horseId: 1, elapsedMs: 8500 },
          { position: 2, horseId: 2, elapsedMs: 9100 },
        ],
      },
    ]
    state.horseLookup.value = new Map([
      [1, { id: 1, name: 'Velvet Vixen', color: '#ff00aa' }],
      [2, { id: 2, name: 'Sunset Sparkle', color: '#00ffaa' }],
    ])

    const mounted = mountComposable(state)
    wrapper = mounted.wrapper

    const runners = mounted.composable.runners.value
    expect(runners[0]).toMatchObject({
      id: 1,
      trackProgress: 1,
      finished: true,
      timeLabel: '8.50 s',
    })
    expect(runners[1].timeLabel).toBe('9.10 s')
  })

  it('computes runner progress using preview segments', () => {
    state.schedule.value = [{ roundNumber: 1, distance: 1200, horseIds: [1] }]
    state.status.value = 'awaiting'
    state.roundDuration.value = 20000
    state.roundRemaining.value = 12000
    state.previewResult.value = {
      roundNumber: 1,
      entries: [{ position: 1, horseId: 1, elapsedMs: 18000 }],
    }
    state.roundSegments.value = {
      1: [5000, 10000, 15000, 18000],
    }
    state.horseLookup.value = new Map([[1, { id: 1, name: 'Velvet Vixen', color: '#ff00aa' }]])

    const mounted = mountComposable(state)
    wrapper = mounted.wrapper

    const runner = mounted.composable.runners.value[0]
    expect(runner.finished).toBe(false)
    expect(runner.trackProgress).toBeGreaterThan(0)
    expect(runner.timeLabel.endsWith('m')).toBe(true)
    expect(runner.timeLabel).not.toBe('Ready')
  })

  it('reacts to status changes for animation helpers', async () => {
    state.schedule.value = [{ roundNumber: 1, distance: 1200, horseIds: [1] }]
    state.horseLookup.value = new Map([[1, { id: 1, name: 'Velvet Vixen', color: '#ff00aa' }]])

    const mounted = mountComposable(state)
    wrapper = mounted.wrapper

    state.status.value = 'running'
    await nextTick()
    expect(mounted.composable.showAnimatedHorse.value).toBe(true)
    expect(mounted.composable.isPaused.value).toBe(false)

    state.status.value = 'paused'
    await nextTick()
    expect(mounted.composable.isPaused.value).toBe(true)
    expect(mounted.composable.showAnimatedHorse.value).toBe(false)
  })
})

