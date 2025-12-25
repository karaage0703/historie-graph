import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useTimelineZoom } from './useTimelineZoom'

describe('useTimelineZoom', () => {
  const createTimeRangeRef = (minYear = -221, maxYear = 280) =>
    ref({ minYear, maxYear })
  const createContainerWidthRef = (width = 1000) => ref(width)

  describe('初期状態', () => {
    it('初期スケールは1.0', () => {
      const { scale } = useTimelineZoom(
        createTimeRangeRef(),
        createContainerWidthRef()
      )
      expect(scale.value).toBe(1)
    })

    it('初期オフセットは0年が中央になるように計算される', () => {
      const containerWidth = 1000
      const timeRange = { minYear: -500, maxYear: 500 }
      const { offsetX } = useTimelineZoom(
        ref(timeRange),
        ref(containerWidth)
      )
      // 0年の位置は (0 - (-500)) * 2 = 1000px
      // 中央に配置するためのオフセット: 1000/2 - 1000 = -500
      expect(offsetX.value).toBe(-500)
    })
  })

  describe('transform計算', () => {
    it('CSS transform文字列を算出する（scaleXのみ）', () => {
      const { transform } = useTimelineZoom(
        createTimeRangeRef(),
        createContainerWidthRef()
      )
      expect(transform.value).toMatch(/translateX.*scaleX/)
    })

    it('スケールとオフセットが反映される', () => {
      const { transform, scale, offsetX } = useTimelineZoom(
        createTimeRangeRef(),
        createContainerWidthRef()
      )
      scale.value = 2
      offsetX.value = 100
      expect(transform.value).toContain('translateX(100px)')
      expect(transform.value).toContain('scaleX(2)')
    })
  })

  describe('ズーム操作', () => {
    it('zoomInでスケールが増加する', () => {
      const { scale, zoomIn } = useTimelineZoom(
        createTimeRangeRef(),
        createContainerWidthRef()
      )
      const initialScale = scale.value
      zoomIn()
      expect(scale.value).toBeGreaterThan(initialScale)
    })

    it('zoomOutでスケールが減少する', () => {
      const { scale, zoomOut } = useTimelineZoom(
        createTimeRangeRef(),
        createContainerWidthRef()
      )
      scale.value = 2
      zoomOut()
      expect(scale.value).toBeLessThan(2)
    })

    it('スケール範囲を0.1倍から10倍に制限する', () => {
      const { scale, zoomIn, zoomOut } = useTimelineZoom(
        createTimeRangeRef(),
        createContainerWidthRef()
      )

      // 最大まで拡大
      for (let i = 0; i < 100; i++) zoomIn()
      expect(scale.value).toBeLessThanOrEqual(10)

      // 最小まで縮小
      for (let i = 0; i < 100; i++) zoomOut()
      expect(scale.value).toBeGreaterThanOrEqual(0.1)
    })

    it('zoomToで任意のスケールに変更できる', () => {
      const { scale, zoomTo } = useTimelineZoom(
        createTimeRangeRef(),
        createContainerWidthRef()
      )
      zoomTo(3, 500)
      expect(scale.value).toBe(3)
    })

    it('zoomToでもスケール範囲は制限される', () => {
      const { scale, zoomTo } = useTimelineZoom(
        createTimeRangeRef(),
        createContainerWidthRef()
      )
      zoomTo(20, 500)
      expect(scale.value).toBe(10)

      zoomTo(0.01, 500)
      expect(scale.value).toBe(0.1)
    })
  })

  describe('パン操作', () => {
    it('panToでオフセットを変更できる', () => {
      const { offsetX, panTo } = useTimelineZoom(
        createTimeRangeRef(),
        createContainerWidthRef()
      )
      panTo(200)
      expect(offsetX.value).toBe(200)
    })

    it('負のオフセットも設定できる', () => {
      const { offsetX, panTo } = useTimelineZoom(
        createTimeRangeRef(),
        createContainerWidthRef()
      )
      panTo(-100)
      expect(offsetX.value).toBe(-100)
    })
  })

  describe('表示範囲算出', () => {
    it('現在表示中の年代範囲を算出する', () => {
      const { visibleYearRange } = useTimelineZoom(
        createTimeRangeRef(),
        createContainerWidthRef()
      )
      expect(visibleYearRange.value.start).toBeDefined()
      expect(visibleYearRange.value.end).toBeDefined()
    })

    it('スケールが大きいと表示範囲が狭くなる', () => {
      const { visibleYearRange, scale } = useTimelineZoom(
        createTimeRangeRef(),
        createContainerWidthRef()
      )
      const initialRange =
        visibleYearRange.value.end - visibleYearRange.value.start

      scale.value = 2
      const zoomedRange =
        visibleYearRange.value.end - visibleYearRange.value.start

      expect(zoomedRange).toBeLessThan(initialRange)
    })

    it('オフセットで表示範囲が移動する', () => {
      const { visibleYearRange, offsetX } = useTimelineZoom(
        createTimeRangeRef(),
        createContainerWidthRef()
      )
      const initialStart = visibleYearRange.value.start

      offsetX.value += 100 // 右にパン
      // オフセットが正なら表示開始年は減少（過去に移動）
      expect(visibleYearRange.value.start).toBeLessThan(initialStart)
    })
  })

  describe('リセット', () => {
    it('resetでスケールを1に戻し、オフセットを初期位置（0年中央）に戻す', () => {
      const containerWidth = 1000
      const timeRange = { minYear: -500, maxYear: 500 }
      const { scale, offsetX, reset, zoomIn, panTo } = useTimelineZoom(
        ref(timeRange),
        ref(containerWidth)
      )

      const initialOffset = offsetX.value

      zoomIn()
      zoomIn()
      panTo(500)

      reset()

      expect(scale.value).toBe(1)
      expect(offsetX.value).toBe(initialOffset)
    })
  })
})
