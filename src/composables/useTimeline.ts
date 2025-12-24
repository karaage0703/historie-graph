import { computed, type Ref } from 'vue'
import type {
  ExtendedHistoryEvent,
  EraLaneData,
  RegionEraGroup,
  PersonLaneData,
  MediaLaneData,
  EventMarkerData,
  TimeRange,
} from '@/types/timeline'

// 地域の表示順序と日本語ラベル
const REGION_ORDER: Record<string, { order: number; label: string }> = {
  china: { order: 0, label: '中国' },
  japan: { order: 1, label: '日本' },
  europe: { order: 2, label: 'ヨーロッパ' },
  middle_east: { order: 3, label: '中東' },
  other: { order: 4, label: 'その他' },
}

// タイムラインの1年あたりのピクセル数（基本値）
const PIXELS_PER_YEAR = 2

export function useTimeline(events: Ref<ExtendedHistoryEvent[]>) {
  /**
   * 年代範囲を算出
   */
  const timeRange = computed<TimeRange>(() => {
    if (events.value.length === 0) {
      return { minYear: 0, maxYear: 0 }
    }

    const years = events.value.map((e) => e.year)
    return {
      minYear: Math.min(...years),
      maxYear: Math.max(...years),
    }
  })

  /**
   * 年をピクセル位置に変換
   */
  const yearToPosition = (year: number): number => {
    const { minYear } = timeRange.value
    return (year - minYear) * PIXELS_PER_YEAR
  }

  /**
   * ピクセル位置を年に変換
   */
  const positionToYear = (position: number): number => {
    const { minYear } = timeRange.value
    return position / PIXELS_PER_YEAR + minYear
  }

  /**
   * 時代レーンデータを生成（国別）
   */
  const eraLanes = computed<EraLaneData[]>(() => {
    // 地域+時代ごとにイベントをグループ化
    const regionEraMap = new Map<string, ExtendedHistoryEvent[]>()

    events.value.forEach((event) => {
      const key = `${event.region}::${event.era}`
      const existing = regionEraMap.get(key) || []
      existing.push(event)
      regionEraMap.set(key, existing)
    })

    // レーンデータを生成
    const lanes: EraLaneData[] = []

    regionEraMap.forEach((eraEvents, key) => {
      const parts = key.split('::')
      const region = parts[0] ?? ''
      const era = parts[1] ?? ''
      const years = eraEvents.map((e) => e.year)
      const startYear = Math.min(...years)
      const endYear = Math.max(...years)

      lanes.push({
        era,
        region,
        startYear,
        endYear,
        duration: Math.abs(endYear - startYear),
        events: eraEvents,
        laneIndex: 0, // 後で重複計算
      })
    })

    // 地域順、開始年順でソート
    lanes.sort((a, b) => {
      const orderA = REGION_ORDER[a.region]?.order ?? 99
      const orderB = REGION_ORDER[b.region]?.order ?? 99
      if (orderA !== orderB) return orderA - orderB
      return a.startYear - b.startYear
    })

    // 地域ごとに重複する時代を異なるレーンに配置
    assignLaneIndicesByRegion(lanes)

    return lanes
  })

  /**
   * 国別に時代レーンをグループ化
   */
  const regionEraGroups = computed<RegionEraGroup[]>(() => {
    const groups = new Map<string, EraLaneData[]>()

    eraLanes.value.forEach((lane) => {
      const existing = groups.get(lane.region) || []
      existing.push(lane)
      groups.set(lane.region, existing)
    })

    const result: RegionEraGroup[] = []
    groups.forEach((lanes, region) => {
      result.push({
        region,
        regionLabel: REGION_ORDER[region]?.label ?? region,
        lanes,
      })
    })

    // 地域順でソート
    result.sort((a, b) => {
      const orderA = REGION_ORDER[a.region]?.order ?? 99
      const orderB = REGION_ORDER[b.region]?.order ?? 99
      return orderA - orderB
    })

    return result
  })

  /**
   * 人物レーンデータを生成
   */
  const personLanes = computed<PersonLaneData[]>(() => {
    // 人物名をキーとして、人物情報と関連イベントIDをまとめる
    const personMap = new Map<
      string,
      { person: PersonLaneData['person']; eventIds: Set<string> }
    >()

    events.value.forEach((event) => {
      if (!event.persons) return

      event.persons.forEach((person) => {
        const existing = personMap.get(person.name)
        if (existing) {
          existing.eventIds.add(event.id)
        } else {
          personMap.set(person.name, {
            person: { ...person },
            eventIds: new Set([event.id]),
          })
        }
      })
    })

    return Array.from(personMap.values()).map(({ person, eventIds }) => ({
      person,
      relatedEventIds: Array.from(eventIds),
    }))
  })

  /**
   * 作品レーンデータを生成
   */
  const mediaLanes = computed<MediaLaneData[]>(() => {
    const lanes: MediaLaneData[] = []

    events.value.forEach((event) => {
      event.media.forEach((media) => {
        lanes.push({
          media,
          parentEventId: event.id,
        })
      })
    })

    return lanes
  })

  /**
   * イベントマーカーデータを生成
   */
  const eventMarkers = computed<EventMarkerData[]>(() => {
    const sortedEvents = [...events.value].sort((a, b) => a.year - b.year)

    return sortedEvents.map((event) => ({
      event,
      position: yearToPosition(event.year),
    }))
  })

  return {
    timeRange,
    eraLanes,
    regionEraGroups,
    personLanes,
    mediaLanes,
    eventMarkers,
    yearToPosition,
    positionToYear,
  }
}

/**
 * 地域ごとに時代の重複を検出し、レーンインデックスを割り当てる
 */
function assignLaneIndicesByRegion(lanes: EraLaneData[]): void {
  // 地域ごとにグループ化
  const regionLanes = new Map<string, EraLaneData[]>()
  lanes.forEach((lane) => {
    const existing = regionLanes.get(lane.region) || []
    existing.push(lane)
    regionLanes.set(lane.region, existing)
  })

  // 地域ごとにレーンインデックスを割り当て
  regionLanes.forEach((regionGroupLanes) => {
    const laneEndYears: number[] = []

    regionGroupLanes.forEach((lane) => {
      // 重複しないレーンを探す
      let assignedLane = -1
      for (let i = 0; i < laneEndYears.length; i++) {
        const endYear = laneEndYears[i]
        if (endYear !== undefined && lane.startYear >= endYear) {
          assignedLane = i
          break
        }
      }

      if (assignedLane === -1) {
        // 新しいレーンを作成
        assignedLane = laneEndYears.length
        laneEndYears.push(lane.endYear)
      } else {
        // 既存レーンを更新
        laneEndYears[assignedLane] = lane.endYear
      }

      lane.laneIndex = assignedLane
    })
  })
}
