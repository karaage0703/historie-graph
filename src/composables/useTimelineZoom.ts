import { ref, computed } from 'vue'
import type { TimeRange, VisibleYearRange } from '@/types/timeline'

const MIN_SCALE = 0.1
const MAX_SCALE = 10
const ZOOM_FACTOR = 1.2
const PIXELS_PER_YEAR = 2

export function useTimelineZoom(
  timeRange: TimeRange,
  containerWidth: number
) {
  const scale = ref(1)
  const offsetX = ref(0)

  const transform = computed(() => {
    return `translateX(${offsetX.value}px) scale(${scale.value})`
  })

  const visibleYearRange = computed<VisibleYearRange>(() => {
    const visibleWidthInYears = containerWidth / (scale.value * PIXELS_PER_YEAR)
    const offsetInYears = offsetX.value / (scale.value * PIXELS_PER_YEAR)

    const start = timeRange.minYear - offsetInYears
    const end = start + visibleWidthInYears

    return { start, end }
  })

  const clampScale = (value: number): number => {
    return Math.max(MIN_SCALE, Math.min(MAX_SCALE, value))
  }

  const zoomIn = (): void => {
    scale.value = clampScale(scale.value * ZOOM_FACTOR)
  }

  const zoomOut = (): void => {
    scale.value = clampScale(scale.value / ZOOM_FACTOR)
  }

  const zoomTo = (newScale: number, _centerX: number): void => {
    scale.value = clampScale(newScale)
  }

  const panTo = (newOffsetX: number): void => {
    offsetX.value = newOffsetX
  }

  const reset = (): void => {
    scale.value = 1
    offsetX.value = 0
  }

  return {
    scale,
    offsetX,
    transform,
    visibleYearRange,
    zoomIn,
    zoomOut,
    zoomTo,
    panTo,
    reset,
  }
}
