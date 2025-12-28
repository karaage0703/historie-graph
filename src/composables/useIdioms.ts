import { computed, type Ref } from 'vue'
import type { Idiom } from '@/types'
import type { IdiomLaneData } from '@/types/timeline'

// useTimeline.tsと同じ間隔設定（80ピクセル / 2ピクセル/年 = 40年）
const MIN_SPACING_YEARS = 40

export function useIdioms(
  idioms: Ref<Idiom[]>,
  selectedRegions?: Ref<string[]>,
  yearRange?: Ref<{ min: number; max: number }>
) {
  const filteredIdioms = computed<Idiom[]>(() => {
    if (!idioms.value) return []

    return idioms.value.filter((idiom) => {
      if (selectedRegions?.value && selectedRegions.value.length > 0) {
        if (!selectedRegions.value.includes(idiom.region)) {
          return false
        }
      }

      if (yearRange?.value) {
        const { min, max } = yearRange.value
        if (idiom.year < min || idiom.year > max) {
          return false
        }
      }

      return true
    })
  })

  const idiomLanes = computed<IdiomLaneData[]>(() => {
    const items = filteredIdioms.value
    if (items.length === 0) return []

    const sortedIdioms = [...items].sort((a, b) => a.year - b.year)

    const laneEndPositions: number[] = []
    const lanes: IdiomLaneData[] = []

    sortedIdioms.forEach((idiom) => {
      // レーン割り当て用に年を使う（位置は後でyearToPositionで計算）
      const yearPos = idiom.year

      let assignedLane = -1

      for (let i = 0; i < laneEndPositions.length; i++) {
        const laneEndYear = laneEndPositions[i]
        if (laneEndYear !== undefined && yearPos >= laneEndYear + MIN_SPACING_YEARS) {
          assignedLane = i
          break
        }
      }

      if (assignedLane === -1) {
        assignedLane = laneEndPositions.length
        laneEndPositions.push(yearPos + MIN_SPACING_YEARS)
      } else {
        laneEndPositions[assignedLane] = yearPos + MIN_SPACING_YEARS
      }

      lanes.push({
        idiom,
        laneIndex: assignedLane,
      })
    })

    return lanes
  })

  const maxLaneIndex = computed(() => {
    if (idiomLanes.value.length === 0) return 0
    return Math.max(...idiomLanes.value.map((l) => l.laneIndex))
  })

  return {
    filteredIdioms,
    idiomLanes,
    maxLaneIndex,
  }
}
