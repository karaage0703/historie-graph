import { ref, computed, type Ref } from 'vue'
import type { CotenRadioData, CotenRadioSeries, PodcastLaneData } from '@/types/timeline'

export function useCotenRadio(selectedRegions?: Ref<string[]>) {
  const cotenData = ref<CotenRadioData | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // フィルター状態
  const showShortSeries = ref(true)

  /**
   * COTEN RADIOデータを読み込む
   */
  const loadCotenRadio = async () => {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch('/coten-radio.json')
      if (!response.ok) {
        throw new Error(`Failed to load: ${response.status}`)
      }
      cotenData.value = await response.json()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      console.error('Failed to load COTEN RADIO data:', e)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * フィルタリングされたシリーズ
   */
  const filteredSeries = computed<CotenRadioSeries[]>(() => {
    if (!cotenData.value) return []

    return cotenData.value.series.filter((series) => {
      // 地域フィルター（共通フィルターを使用）
      if (selectedRegions?.value && selectedRegions.value.length > 0) {
        if (!selectedRegions.value.includes(series.region)) {
          return false
        }
      }

      // ショートシリーズフィルター
      if (!showShortSeries.value && series.type === 'short') {
        return false
      }

      return true
    })
  })

  /**
   * Podcastレーンデータを生成（重複を考慮してレーンインデックスを割り当て）
   * ピクセルベースで最小幅を考慮し、視覚的な重なりを回避
   */
  const podcastLanes = computed<PodcastLaneData[]>(() => {
    const series = filteredSeries.value
    if (series.length === 0) return []

    // 1年あたり2ピクセル（useTimelineと同じ値）
    const PIXELS_PER_YEAR = 2
    // 最小幅（ピクセル）- PodcastLane.vueのMath.max(endX - x, 60)と同じ
    const MIN_WIDTH_PX = 60
    // 最小間隔（ピクセル）
    const MIN_SPACING_PX = 10

    // ピクセル位置を計算するヘルパー
    const yearToPosition = (year: number) => year * PIXELS_PER_YEAR

    // 開始年でソート
    const sortedSeries = [...series].sort((a, b) => a.coverageStartYear - b.coverageStartYear)

    // 重複を考慮してレーンインデックスを割り当て
    const laneEndPositions: number[] = []
    const lanes: PodcastLaneData[] = []

    sortedSeries.forEach((s) => {
      const startPos = yearToPosition(s.coverageStartYear)
      const endPos = yearToPosition(s.coverageEndYear)
      // 実際の描画幅（最小幅を考慮）
      const actualWidth = Math.max(endPos - startPos, MIN_WIDTH_PX)
      const actualEndPos = startPos + actualWidth

      let assignedLane = -1

      // 重複しないレーンを探す
      for (let i = 0; i < laneEndPositions.length; i++) {
        const laneEndPos = laneEndPositions[i]
        if (laneEndPos !== undefined && startPos >= laneEndPos + MIN_SPACING_PX) {
          assignedLane = i
          break
        }
      }

      if (assignedLane === -1) {
        // 新しいレーンを作成
        assignedLane = laneEndPositions.length
        laneEndPositions.push(actualEndPos)
      } else {
        // 既存レーンを更新
        laneEndPositions[assignedLane] = actualEndPos
      }

      lanes.push({
        series: s,
        laneIndex: assignedLane,
      })
    })

    return lanes
  })

  /**
   * レーンの最大インデックス
   */
  const maxLaneIndex = computed(() => {
    if (podcastLanes.value.length === 0) return 0
    return Math.max(...podcastLanes.value.map((l) => l.laneIndex))
  })

  /**
   * Podcast情報
   */
  const podcastInfo = computed(() => cotenData.value?.podcast ?? null)

  return {
    cotenData,
    isLoading,
    error,
    showShortSeries,
    loadCotenRadio,
    filteredSeries,
    podcastLanes,
    maxLaneIndex,
    podcastInfo,
  }
}
