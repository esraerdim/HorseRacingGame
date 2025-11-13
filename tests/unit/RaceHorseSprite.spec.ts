import { describe, it, expect } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import RaceHorseSprite from '@/components/widgets/RaceHorseSprite.vue'

type RaceHorseSpriteProps = InstanceType<typeof RaceHorseSprite>['$props']

const baseProps: RaceHorseSpriteProps = {
  progress: 0.3,
  color: '#ff0000',
  running: false,
  finished: false,
  paused: false,
}

const mountComponent = (props?: Partial<RaceHorseSpriteProps>): VueWrapper =>
  mount(RaceHorseSprite, {
    props: {
      ...baseProps,
      ...props,
    },
  })

describe('RaceHorseSprite', () => {

  it('renders horse with provided color', () => {
    const wrapper = mountComponent({ color: '#00ffaa' })
    const horse = wrapper.get('.race-horse')

    expect(horse.attributes('style')).toContain('--horse-color: #00ffaa')
  })

  it('applies running classes when running and not finished', () => {
    const wrapper = mountComponent({ running: true })
    expect(wrapper.classes()).toContain('race-horse-wrapper--running')
    expect(wrapper.get('.race-horse').classes()).toContain('race-horse--running')
    expect(wrapper.get('.race-horse').classes()).not.toContain('race-horse--idle')
  })

  it('marks horse idle when not running', () => {
    const wrapper = mountComponent()
    expect(wrapper.classes()).not.toContain('race-horse-wrapper--running')
    expect(wrapper.get('.race-horse').classes()).toContain('race-horse--idle')
  })

  it('prioritises finished state over running', () => {
    const wrapper = mountComponent({ running: true, finished: true })
    const horse = wrapper.get('.race-horse')

    expect(wrapper.classes()).not.toContain('race-horse-wrapper--running')
    expect(horse.classes()).toContain('race-horse--finished')
    expect(horse.classes()).not.toContain('race-horse--running')
  })

  it('adds paused class when paused', () => {
    const wrapper = mountComponent({ paused: true })
    expect(wrapper.get('.race-horse').classes()).toContain('race-horse--paused')
  })

  it('clamps progress to [0,1] in css variable', async () => {
    const wrapper = mountComponent({ progress: 1.7 })
    expect(wrapper.attributes('style')).toContain('--progress: 1')

    await wrapper.setProps({ progress: -0.2 })
    expect(wrapper.attributes('style')).toContain('--progress: 0')
  })
})

