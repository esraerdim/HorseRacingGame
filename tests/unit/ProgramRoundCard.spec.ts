import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProgramRoundCard from '@/components/features/ProgramRoundCard.vue'

const defaultProps = {
  index: 1,
  title: '1st Lap',
  distance: 1200,
  horses: ['Sunset Sparkle', 'Baby Shark', 'Velvet Vixen'],
}

describe('ProgramRoundCard', () => {
  it('renders lap information and horse list', () => {
    const wrapper = mount(ProgramRoundCard, {
      props: defaultProps,
    })

    expect(wrapper.get('.program-round-card__index').text()).toBe('1')
    expect(wrapper.text()).toContain('1st Lap')
    expect(wrapper.text()).toContain('1200 m')
    expect(wrapper.text()).toContain('3 horses')

    const horseNames = wrapper.findAll('.program-round-card__horse').map((node) => node.text())
    expect(horseNames).toEqual(defaultProps.horses)
  })

  it('applies active styles when active prop is true', () => {
    const wrapper = mount(ProgramRoundCard, {
      props: {
        ...defaultProps,
        active: true,
      },
    })

    expect(wrapper.classes()).toContain('program-round-card--active')
  })
})

