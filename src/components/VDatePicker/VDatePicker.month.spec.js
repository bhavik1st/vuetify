import Vue from 'vue'
import { test } from '@util/testing'
import VDatePicker from './VDatePicker'
import VMenu from '@components/VMenu'

function createMenuPicker (mount, props) {
  const wrapper = mount(Vue.component('test', {
    components: {
      VDatePicker,
      VMenu
    },
    render (h) {
      return h('v-menu', {
        ref: 'menu'
      }, [h('v-date-picker', {
        props,
        ref: 'picker'
      })])
    }
  }))

  const menu = wrapper.vm.$refs.menu
  menu.isActive = true

  const picker = menu.$slots.default[0].context.$refs.picker

  expect('Unable to locate target [data-app]').toHaveBeenTipped()

  return { wrapper, menu, picker }
}

test('VDatePicker.js', ({ mount, compileToFunctions }) => {
  it('should emit input event on year click', async () => {
    const cb = jest.fn()
    const wrapper = mount(VDatePicker, {
      propsData: {
        value: '2013-05',
        type: 'month'
      },
      data: {
        activePicker: 'YEAR'
      }
    })

    wrapper.vm.$on('input', cb);
    wrapper.find('.date-picker-years li.active + li')[0].trigger('click')
    expect(cb).toBeCalledWith('2012-05')
  })

  it('should not emit input event on year click if month is not allowed', async () => {
    const cb = jest.fn()
    const wrapper = mount(VDatePicker, {
      propsData: {
        value: '2013-05',
        type: 'month',
        allowedDates: []
      },
      data: {
        activePicker: 'YEAR'
      }
    })

    wrapper.vm.$on('input', cb);
    wrapper.find('.date-picker-years li.active + li')[0].trigger('click')
    expect(cb).not.toBeCalled()
  })

  it('should emit input event on month click', async () => {
    const cb = jest.fn()
    const wrapper = mount(VDatePicker, {
      propsData: {
        value: '2013-05',
        type: 'month'
      }
    })

    wrapper.vm.$on('input', cb);
    wrapper.find('.date-picker-table--month button')[0].trigger('click')
    expect(cb).toBeCalledWith('2013-01')
  })

  it('should be scrollable', async () => {
    const wrapper = mount(VDatePicker, {
      propsData: {
        value: '2013-05',
        type: 'month',
        scrollable: true
      }
    })

    wrapper.find('.date-picker-table--month')[0].trigger('wheel')
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.tableDate).toBe('2014')
  })

  it('should match snapshot with pick-month prop', () => {
    const wrapper = mount(VDatePicker, {
      propsData: {
        value: '2013-05-07',
        type: 'month'
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should match snapshot with allowed dates as array', () => {
    const wrapper = mount(VDatePicker, {
      propsData: {
        value: '2013-05',
        type: 'month',
        allowedDates: ['2013-01', '2013-03', '2013-05', '2013-07', 'invalid month']
      }
    })

    expect(wrapper.find('.date-picker-table--month tbody')[0].html()).toMatchSnapshot()
  })

  it('should match snapshot with month formatting functions', () => {
    const wrapper = mount(VDatePicker, {
      propsData: {
        value: '2005-11-01',
        type: 'month',
        monthFormat: date => `(${date.split('-')[1]})`
      }
    })

    expect(wrapper.find('.date-picker-table--month tbody')[0].html()).toMatchSnapshot()
  })

  it('should match snapshot with colored picker', () => {
    const wrapper = mount(VDatePicker, {
      propsData: {
        type: 'month',
        value: '2005-11-01',
        color: 'primary',
        headerColor: 'orange darken-1'
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should match snapshot with colored picker', () => {
    const wrapper = mount(VDatePicker, {
      propsData: {
        type: 'month',
        value: '2005-11-01',
        color: 'orange darken-1'
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should match change month when clicked on header arrow buttons', () => {
    const wrapper = mount(VDatePicker, {
      propsData: {
        value: '2005-11',
        type: 'month'
      }
    })

    const [leftButton, rightButton] = wrapper.find('.date-picker-header button')

    leftButton.trigger('click')
    expect(wrapper.vm.tableDate).toBe('2004')

    rightButton.trigger('click')
    expect(wrapper.vm.tableDate).toBe('2006')
  })

  it('should match change active picker when clicked on month button', () => {
    const wrapper = mount(VDatePicker, {
      propsData: {
        value: '2005-11-01',
        type: 'month'
      }
    })

    const button = wrapper.find('.date-picker-header strong')[0]

    button.trigger('click')
    expect(wrapper.vm.activePicker).toBe('YEAR')
  })

  it('should select year', async () => {
    const wrapper = mount(VDatePicker, {
      data: {
        activePicker: 'YEAR'
      },
      propsData: {
        type: 'month',
        value: '2005-11'
      }
    })

    wrapper.find('.date-picker-years li.active + li')[0].trigger('click')
    expect(wrapper.vm.activePicker).toBe('MONTH')
    expect(wrapper.vm.tableDate).toBe('2004')
  })

  it('should calculate the first allowed date', () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()

    const wrapper2 = mount(VDatePicker, {
      propsData: {
        value: null,
        type: 'month',
        allowedDates: [`${year}-03`]
      }
    })
    expect(wrapper2.vm.inputDate).toBe(`${year}-03`)
  })

  it('should set the table date when value has changed', () => {
    const wrapper = mount(VDatePicker, {
      propsData: {
        value: null,
        type: 'month'
      }
    })

    wrapper.setProps({ value: '2005-11' })
    expect(wrapper.vm.tableDate).toBe('2005')
  })

  it('should update with autosave on month click', async () => {
    const { wrapper, menu, picker } = createMenuPicker(mount, {
      type: 'month',
      value: '2013-05',
      autosave: true
    })

    const input = jest.fn()
    picker.$on('input', input)

    picker.monthClick('2013-06')
    expect(menu.isActive).toBe(true)
    await wrapper.vm.$nextTick()
    expect(menu.isActive).toBe(false)
    expect(input).toBeCalledWith('2013-06')
  })

  it('should use prev and next icons', () => {
    const wrapper = mount(VDatePicker, {
      propsData: {
        type: 'month',
        prependIcon: 'block',
        appendIcon: 'check'
      }
    })

    const icons = wrapper.find('.date-picker-header .icon')
    expect(icons[0].element.textContent).toBe('block')
    expect(icons[1].element.textContent).toBe('check')
  })
})
