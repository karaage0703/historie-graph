import { ref, computed } from 'vue'
import type { HistoryEvent, MediaItem } from '@/types'

const selectedRegions = ref<string[]>([])
const selectedEras = ref<string[]>([])

// 年代フィルタ
const yearRangeMin = ref<number | null>(null)
const yearRangeMax = ref<number | null>(null)
const defaultYearRangeMin = ref<number>(0)
const defaultYearRangeMax = ref<number>(2100)

// タイムラインセクション表示切り替え
const showEvents = ref(true)
const showCotenRadio = ref(true)
const showMedia = ref(true)

// 地域ラベル（共通）
export const REGION_LABELS: Record<string, string> = {
  china: '中国',
  japan: '日本',
  europe: 'ヨーロッパ',
  middle_east: '中東',
  asia: 'アジア',
  americas: 'アメリカ',
  world: '世界史',
  other: 'その他',
}

export function useFilters() {
  const hasActiveFilters = computed(() => {
    return (
      selectedRegions.value.length > 0 ||
      selectedEras.value.length > 0 ||
      yearRangeMin.value !== null ||
      yearRangeMax.value !== null
    )
  })

  // 有効な年代範囲（デフォルト値またはユーザー設定値）
  const effectiveYearRange = computed(() => ({
    min: yearRangeMin.value ?? defaultYearRangeMin.value,
    max: yearRangeMax.value ?? defaultYearRangeMax.value,
  }))

  function setRegionFilter(regions: string[]): void {
    selectedRegions.value = regions
  }

  function setEraFilter(eras: string[]): void {
    selectedEras.value = eras
  }

  function clearFilters(): void {
    selectedRegions.value = []
    selectedEras.value = []
    yearRangeMin.value = null
    yearRangeMax.value = null
  }

  function setYearRange(min: number | null, max: number | null): void {
    yearRangeMin.value = min
    yearRangeMax.value = max
  }

  /**
   * イベントと作品データから妥当なデフォルト年代範囲を計算
   * イベントと作品の両方を考慮し、外れ値（縄文時代など）を除外
   */
  function initializeDefaultYearRange(events: HistoryEvent[], media: MediaItem[]): void {
    // イベントの年を収集（外れ値を除外）
    const eventYears = events.map((e) => e.year).sort((a, b) => a - b)
    let eventMin = 0
    let eventMax = 2100

    if (eventYears.length > 0) {
      // 下位1%と上位99%のパーセンタイルを使用して極端な外れ値のみ除外
      const lowerIndex = Math.max(1, Math.floor(eventYears.length * 0.01))
      const upperIndex = Math.min(eventYears.length - 1, Math.ceil(eventYears.length * 0.99) - 1)

      eventMin = eventYears[lowerIndex] ?? eventYears[0] ?? 0
      eventMax = eventYears[upperIndex] ?? eventYears[eventYears.length - 1] ?? 2100
    }

    // 作品のカバー範囲を収集
    const mediaYears: number[] = []
    media.forEach((m) => {
      if (m.coverageStartYear !== undefined) mediaYears.push(m.coverageStartYear)
      if (m.coverageEndYear !== undefined) mediaYears.push(m.coverageEndYear)
    })

    let mediaMin = eventMin
    let mediaMax = eventMax

    if (mediaYears.length >= 2) {
      mediaMin = Math.min(...mediaYears)
      mediaMax = Math.max(...mediaYears)
    }

    // イベントと作品の両方を含む範囲を採用
    defaultYearRangeMin.value = Math.min(eventMin, mediaMin)
    defaultYearRangeMax.value = Math.max(eventMax, mediaMax)
  }

  function filteredEvents(events: HistoryEvent[]): HistoryEvent[] {
    return events.filter((event) => {
      const regionMatch =
        selectedRegions.value.length === 0 ||
        selectedRegions.value.includes(event.region)

      const eraMatch =
        selectedEras.value.length === 0 || selectedEras.value.includes(event.era)

      const yearMatch =
        event.year >= effectiveYearRange.value.min &&
        event.year <= effectiveYearRange.value.max

      return regionMatch && eraMatch && yearMatch
    })
  }

  function filteredMedia(media: MediaItem[]): MediaItem[] {
    return media.filter((m) => {
      // カバー範囲が設定されていない作品は表示
      if (m.coverageStartYear === undefined && m.coverageEndYear === undefined) {
        return true
      }

      const start = m.coverageStartYear ?? m.coverageEndYear ?? 0
      const end = m.coverageEndYear ?? m.coverageStartYear ?? 0

      // 作品のカバー範囲とフィルタ範囲が重なっていれば表示
      return start <= effectiveYearRange.value.max && end >= effectiveYearRange.value.min
    })
  }

  function availableRegions(events: HistoryEvent[]): string[] {
    const regions = new Set(events.map((e) => e.region))
    return Array.from(regions).sort()
  }

  function availableEras(events: HistoryEvent[]): string[] {
    const eras = new Set(events.map((e) => e.era))
    return Array.from(eras).sort()
  }

  return {
    selectedRegions,
    selectedEras,
    hasActiveFilters,
    setRegionFilter,
    setEraFilter,
    clearFilters,
    filteredEvents,
    filteredMedia,
    availableRegions,
    availableEras,
    // 年代フィルタ
    yearRangeMin,
    yearRangeMax,
    defaultYearRangeMin,
    defaultYearRangeMax,
    effectiveYearRange,
    setYearRange,
    initializeDefaultYearRange,
    // 表示切り替え
    showEvents,
    showCotenRadio,
    showMedia,
  }
}
