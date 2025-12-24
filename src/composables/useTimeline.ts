import { computed, type Ref } from 'vue'
import type {
  ExtendedHistoryEvent,
  EraLaneData,
  PersonLaneData,
  MediaLaneData,
  EventMarkerData,
  TimeRange,
} from '@/types/timeline'

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
   * 時代レーンデータを生成
   */
  const eraLanes = computed<EraLaneData[]>(() => {
    // 時代ごとにイベントをグループ化
    const eraMap = new Map<string, ExtendedHistoryEvent[]>()

    events.value.forEach((event) => {
      const existing = eraMap.get(event.era) || []
      existing.push(event)
      eraMap.set(event.era, existing)
    })

    // 時代ごとにレーンデータを生成
    const lanes: EraLaneData[] = []

    eraMap.forEach((eraEvents, era) => {
      const years = eraEvents.map((e) => e.year)
      const startYear = Math.min(...years)
      const endYear = Math.max(...years)

      lanes.push({
        era,
        startYear,
        endYear,
        duration: Math.abs(endYear - startYear),
        events: eraEvents,
        laneIndex: 0, // 後で重複計算
      })
    })

    // 開始年でソート
    lanes.sort((a, b) => a.startYear - b.startYear)

    // 重複する時代を異なるレーンに配置
    assignLaneIndices(lanes)

    return lanes
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
    personLanes,
    mediaLanes,
    eventMarkers,
    yearToPosition,
    positionToYear,
  }
}

/**
 * 時代の重複を検出し、レーンインデックスを割り当てる
 */
function assignLaneIndices(lanes: EraLaneData[]): void {
  // 各レーンの終了年を追跡
  const laneEndYears: number[] = []

  lanes.forEach((lane) => {
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
}
