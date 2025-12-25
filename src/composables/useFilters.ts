import { ref, computed } from 'vue'
import type { HistoryEvent } from '@/types'

const selectedRegions = ref<string[]>([])
const selectedEras = ref<string[]>([])

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
    return selectedRegions.value.length > 0 || selectedEras.value.length > 0
  })

  function setRegionFilter(regions: string[]): void {
    selectedRegions.value = regions
  }

  function setEraFilter(eras: string[]): void {
    selectedEras.value = eras
  }

  function clearFilters(): void {
    selectedRegions.value = []
    selectedEras.value = []
  }

  function filteredEvents(events: HistoryEvent[]): HistoryEvent[] {
    return events.filter((event) => {
      const regionMatch =
        selectedRegions.value.length === 0 ||
        selectedRegions.value.includes(event.region)

      const eraMatch =
        selectedEras.value.length === 0 || selectedEras.value.includes(event.era)

      return regionMatch && eraMatch
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
    availableRegions,
    availableEras,
    // 表示切り替え
    showEvents,
    showCotenRadio,
    showMedia,
  }
}
