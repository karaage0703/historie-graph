import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import TimelineCanvas from './TimelineCanvas.vue'
import MediaLane from './MediaLane.vue'
import type { MediaItem } from '@/types'
import type { ExtendedHistoryEvent } from '@/types/timeline'

const events: ExtendedHistoryEvent[] = [
  {
    id: 'china-jin-end',
    year: 1234,
    yearDisplay: '1234年',
    era: '金',
    region: 'china',
    title: '金の滅亡',
    description: '',
    links: [],
  },
]

const media: MediaItem[] = [
  {
    id: 'test-media',
    title: 'テスト作品',
    type: 'manga',
    remark: 'クリック確認用',
    coverageStartYear: 1220,
    coverageEndYear: 1237,
    relatedEventIds: ['china-jin-end'],
  },
]

const mountTimeline = async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ podcast: {}, series: [] }),
    })
  )

  const wrapper = mount(TimelineCanvas, {
    props: {
      events,
      allEvents: events,
      media,
      allMedia: media,
      idioms: [],
    },
  })
  await flushPromises()
  return wrapper
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('TimelineCanvas pointer interactions', () => {
  it('opens the media popover when a pointer is clicked without dragging', async () => {
    const wrapper = await mountTimeline()
    const container = wrapper.find('.touch-pan-y').element as HTMLElement
    const setPointerCapture = vi.fn()
    Object.defineProperties(container, {
      setPointerCapture: { value: setPointerCapture },
      hasPointerCapture: { value: vi.fn().mockReturnValue(false) },
    })

    const mediaLane = wrapper.findComponent(MediaLane)
    const mediaRect = mediaLane.find('rect')

    await mediaRect.trigger('pointerdown', {
      pointerId: 1,
      pointerType: 'mouse',
      button: 0,
      isPrimary: true,
      clientX: 100,
      clientY: 100,
    })
    expect(setPointerCapture).not.toHaveBeenCalled()

    await mediaRect.trigger('pointerup', { pointerId: 1 })
    await mediaRect.trigger('click', { clientX: 100, clientY: 100 })

    expect(wrapper.find('.fixed.z-50').exists()).toBe(true)
    expect(wrapper.find('.fixed.z-50').text()).toContain('テスト作品')
    wrapper.unmount()
  })

  it('captures the pointer only after a horizontal drag starts', async () => {
    const wrapper = await mountTimeline()
    const containerWrapper = wrapper.find('.touch-pan-y')
    const container = containerWrapper.element as HTMLElement
    const setPointerCapture = vi.fn()
    const hasPointerCapture = vi.fn().mockReturnValue(true)
    const releasePointerCapture = vi.fn()
    Object.defineProperties(container, {
      setPointerCapture: { value: setPointerCapture },
      hasPointerCapture: { value: hasPointerCapture },
      releasePointerCapture: { value: releasePointerCapture },
    })

    const mediaRect = wrapper.findComponent(MediaLane).find('rect')
    await mediaRect.trigger('pointerdown', {
      pointerId: 2,
      pointerType: 'mouse',
      button: 0,
      isPrimary: true,
      clientX: 100,
      clientY: 100,
    })
    await mediaRect.trigger('pointermove', {
      pointerId: 2,
      clientX: 110,
      clientY: 101,
    })

    expect(setPointerCapture).toHaveBeenCalledWith(2)
    expect(containerWrapper.classes()).toContain('cursor-grabbing')

    await containerWrapper.trigger('pointerup', { pointerId: 2 })
    expect(releasePointerCapture).toHaveBeenCalledWith(2)
    expect(containerWrapper.classes()).toContain('cursor-grab')
    wrapper.unmount()
  })
})
