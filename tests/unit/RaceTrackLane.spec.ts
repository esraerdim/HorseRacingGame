import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RaceTrackLane from '@/components/widgets/RaceTrackLane.vue'
import RaceHorseSprite from '@/components/widgets/RaceHorseSprite.vue'

describe('RaceTrackLane', () => {
  const baseProps = {
    laneIndex: 3,
    name: 'Sunset Sparkle',
    progress: 0.42,
    color: '#ff00aa',
    running: true,
    finished: false,
    paused: false,
  }

  it('renders lane number and horse name', () => {
    const wrapper = mount(RaceTrackLane, {
      props: baseProps,
    })

    expect(wrapper.get('.race-track-lane__number').text()).toBe('4')
    expect(wrapper.get('.race-track-lane__label').text()).toBe('Sunset Sparkle')
  })

  it('passes state props to RaceHorseSprite', () => {
    const wrapper = mount(RaceTrackLane, {
      props: baseProps,
    })

    const sprite = wrapper.getComponent(RaceHorseSprite)
    expect(sprite.props()).toMatchObject({
      progress: baseProps.progress,
      color: baseProps.color,
      running: baseProps.running,
      finished: baseProps.finished,
      paused: baseProps.paused,
    })
  })

  it('marks horse as finished when prop is true', () => {
    const wrapper = mount(RaceTrackLane, {
      props: {
        ...baseProps,
        finished: true,
        running: false,
      },
    })

    const sprite = wrapper.getComponent(RaceHorseSprite)
    expect(sprite.props().finished).toBe(true)
    expect(sprite.props().running).toBe(false)
  })
})

