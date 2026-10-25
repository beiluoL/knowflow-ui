import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import KfIcon from '../components/icon/KfIcon.vue'
import type { IconSize } from '../components/icon/types'
import {
  getIconMarkup,
  isBuiltinIcon,
  listIconNames,
  registerIcon,
  unregisterIcon,
} from '../components/icon/registry'

describe('KfIcon', () => {
  afterEach(() => {
    unregisterIcon('kf-test-icon')
  })

  it('内置图标渲染内联 SVG，path 来自注册表', () => {
    const wrapper = mount(KfIcon, { props: { name: 'check' } })
    const svg = wrapper.get('svg')
    expect(svg.attributes('viewBox')).toBe('0 0 24 24')
    expect(svg.html()).toContain('<path')
  })

  it('默认装饰性：aria-hidden=true 且不输出 role/aria-label', () => {
    const wrapper = mount(KfIcon, { props: { name: 'bell' } })
    const svg = wrapper.get('svg')
    expect(svg.attributes('aria-hidden')).toBe('true')
    expect(svg.attributes('role')).toBeUndefined()
    expect(svg.attributes('aria-label')).toBeUndefined()
  })

  it('decorative=false 时输出 role=img + aria-label', () => {
    const wrapper = mount(KfIcon, {
      props: { name: 'flame', decorative: false, ariaLabel: '连续学习 12 天' },
    })
    const svg = wrapper.get('svg')
    expect(svg.attributes('role')).toBe('img')
    expect(svg.attributes('aria-label')).toBe('连续学习 12 天')
    expect(svg.attributes('aria-hidden')).toBeUndefined()
  })

  it('语义尺寸映射为像素宽高', () => {
    const cases: [IconSize, string][] = [
      ['xxs', '10'],
      ['xs', '12'],
      ['sm', '14'],
      ['md', '16'],
      ['lg', '18'],
      ['xl', '20'],
      ['2xl', '24'],
      ['3xl', '32'],
    ]
    for (const [size, px] of cases) {
      const wrapper = mount(KfIcon, { props: { name: 'check', size } })
      const svg = wrapper.get('svg')
      expect(svg.attributes('width')).toBe(px)
      expect(svg.attributes('height')).toBe(px)
    }
  })

  it('数字尺寸按像素直传', () => {
    const wrapper = mount(KfIcon, { props: { name: 'check', size: 22 } })
    expect(wrapper.get('svg').attributes('width')).toBe('22')
  })

  it('color 通过内联样式应用，缺省时继承 currentColor', () => {
    const colored = mount(KfIcon, { props: { name: 'check', color: 'red' } })
    expect(colored.get('svg').attributes('style')).toContain('color: red')

    const inherited = mount(KfIcon, { props: { name: 'check' } })
    expect(inherited.get('svg').attributes('style')).toBeUndefined()
    expect(inherited.get('svg').attributes('stroke')).toBe('currentColor')
  })

  it('未知图标不渲染 svg，也不抛出异常', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = mount(KfIcon, { props: { name: 'not-a-real-icon' } })
    expect(wrapper.find('svg').exists()).toBe(false)
    expect(wrapper.find('.kf-icon--missing').exists()).toBe(true)
    warn.mockRestore()
  })

  it('registerIcon 扩展后可按名渲染，unregister 后失效', () => {
    registerIcon('kf-test-icon', '<circle cx="12" cy="12" r="6" />')
    expect(isBuiltinIcon('kf-test-icon')).toBe(false)
    expect(listIconNames()).toContain('kf-test-icon')
    expect(getIconMarkup('kf-test-icon')).toContain('<circle')

    const wrapper = mount(KfIcon, { props: { name: 'kf-test-icon' } })
    expect(wrapper.get('svg').html()).toContain('<circle')

    unregisterIcon('kf-test-icon')
    expect(getIconMarkup('kf-test-icon')).toBeUndefined()
  })

  it('图片型图标渲染 img 并保留尺寸', () => {
    const wrapper = mount(KfIcon, { props: { name: 'https://example.com/a.png', size: 'lg' } })
    const img = wrapper.get('img')
    expect(img.attributes('width')).toBe('18')
    expect(img.attributes('aria-hidden')).toBe('true')
  })

  it('内置图标数量与注册表一致', () => {
    expect(listIconNames().length).toBeGreaterThanOrEqual(70)
    expect(isBuiltinIcon('check')).toBe(true)
    expect(isBuiltinIcon('sparkles')).toBe(true)
  })
})
