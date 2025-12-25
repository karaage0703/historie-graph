import { ref, computed, type Ref, watch } from 'vue'
import type { TimeRange, VisibleYearRange } from '@/types/timeline'

const MIN_SCALE = 0.1
const MAX_SCALE = 10
const ZOOM_FACTOR = 1.2
const PIXELS_PER_YEAR = 2

export function useTimelineZoom(
  timeRangeRef: Ref<TimeRange>,
  containerWidthRef: Ref<number>
) {
  const scale = ref(1)
  const offsetX = ref(0)
  const initialized = ref(false)

  // 0年を中央に表示するためのオフセットを計算
  const calculateInitialOffset = () => {
    const timeRange = timeRangeRef.value
    const containerWidth = containerWidthRef.value
    if (timeRange.minYear === 0 && timeRange.maxYear === 0) return 0

    // 0年の位置（minYearからのピクセル距離）
    const yearZeroPosition = (0 - timeRange.minYear) * PIXELS_PER_YEAR
    // コンテナの中央に0年を配置するためのオフセット
    return containerWidth / 2 - yearZeroPosition * scale.value
  }

  // 初期化（timeRangeとcontainerWidthが設定された後）
  watch(
    [timeRangeRef, containerWidthRef],
    () => {
      if (!initialized.value && timeRangeRef.value.minYear !== timeRangeRef.value.maxYear && containerWidthRef.value > 0) {
        offsetX.value = calculateInitialOffset()
        initialized.value = true
      }
    },
    { immediate: true }
  )

  // X軸のみスケール（Y軸はスケールしない）
  const transform = computed(() => {
    return `translateX(${offsetX.value}px) scaleX(${scale.value})`
  })

  const visibleYearRange = computed<VisibleYearRange>(() => {
    const containerWidth = containerWidthRef.value
    const timeRange = timeRangeRef.value
    const visibleWidthInYears = containerWidth / (scale.value * PIXELS_PER_YEAR)
    // offsetXはスケール適用後のピクセル位置なので、スケールで割らない
    const offsetInYears = offsetX.value / (scale.value * PIXELS_PER_YEAR)

    const start = timeRange.minYear - offsetInYears
    const end = start + visibleWidthInYears

    return { start, end }
  })

  const clampScale = (value: number): number => {
    return Math.max(MIN_SCALE, Math.min(MAX_SCALE, value))
  }

  // 画面中央を基準にズーム
  const zoomAtCenter = (newScale: number): void => {
    const containerWidth = containerWidthRef.value
    const oldScale = scale.value
    const clampedNewScale = clampScale(newScale)

    // 現在の画面中央のコンテンツ位置（スケール適用前の座標）
    const centerContentX = (containerWidth / 2 - offsetX.value) / oldScale

    // 新しいスケールで同じ位置が中央に来るようにオフセットを計算
    const newOffsetX = containerWidth / 2 - centerContentX * clampedNewScale

    scale.value = clampedNewScale
    offsetX.value = newOffsetX
  }

  const zoomIn = (): void => {
    zoomAtCenter(scale.value * ZOOM_FACTOR)
  }

  const zoomOut = (): void => {
    zoomAtCenter(scale.value / ZOOM_FACTOR)
  }

  const zoomTo = (newScale: number, _centerX: number): void => {
    zoomAtCenter(newScale)
  }

  const panTo = (newOffsetX: number): void => {
    offsetX.value = newOffsetX
  }

  const reset = (): void => {
    scale.value = 1
    offsetX.value = calculateInitialOffset()
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
