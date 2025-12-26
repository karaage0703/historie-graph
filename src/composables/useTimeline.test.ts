import { describe, it, expect } from 'vitest'
import { useTimeline } from './useTimeline'
import { ref } from 'vue'
import type { ExtendedHistoryEvent } from '@/types/timeline'
import type { MediaItem } from '@/types'

describe('useTimeline', () => {
  // ヘルパー: 同じeventsを両方の引数に渡す（テスト用）
  const useTimelineWithSameEvents = (
    events: ReturnType<typeof ref<ExtendedHistoryEvent[]>>,
    media: ReturnType<typeof ref<MediaItem[]>>
  ) => useTimeline(
    events as unknown as Parameters<typeof useTimeline>[0],
    events as unknown as Parameters<typeof useTimeline>[1],
    media as unknown as Parameters<typeof useTimeline>[2],
    media as unknown as Parameters<typeof useTimeline>[3]
  )

  const createTestEvents = (): ExtendedHistoryEvent[] => [
    {
      id: '1',
      year: -221,
      yearDisplay: '前221年',
      era: '秦',
      region: 'china',
      title: '秦の統一',
      description: '始皇帝が中国を統一',
      links: [],
      persons: [
        { name: '始皇帝', birthYear: -259, deathYear: -210 },
        { name: '李斯', birthYear: -280, deathYear: -208 },
      ],
    },
    {
      id: '2',
      year: -206,
      yearDisplay: '前206年',
      era: '楚漢戦争',
      region: 'china',
      title: '秦の滅亡',
      description: '秦王朝が滅亡',
      links: [],
      persons: [{ name: '項羽', birthYear: -232, deathYear: -202 }],
    },
    {
      id: '3',
      year: -202,
      yearDisplay: '前202年',
      era: '前漢',
      region: 'china',
      title: '漢の建国',
      description: '劉邦が漢を建国',
      links: [],
      persons: [{ name: '劉邦', birthYear: -256, deathYear: -195 }],
    },
    {
      id: '4',
      year: 184,
      yearDisplay: '184年',
      era: '後漢末',
      region: 'china',
      title: '黄巾の乱',
      description: '',
      links: [],
    },
  ]

  const createTestMedia = (): MediaItem[] => [
    {
      id: 'kingdom',
      title: 'キングダム',
      type: 'manga',
      remark: '',
      coverageStartYear: -259,
      coverageEndYear: -221,
      kindleUrl: 'https://amazon.co.jp/dp/B00XXX',
      relatedEventIds: ['1'],
    },
    {
      id: 'kouu-ryuuhou',
      title: '項羽と劉邦',
      type: 'novel',
      remark: '',
      coverageStartYear: -232,
      coverageEndYear: -195,
      relatedEventIds: ['2', '3'],
    },
  ]

  describe('timeRange（年代範囲算出）', () => {
    it('全イベントの最小年と最大年を計算する', () => {
      const events = ref(createTestEvents())
      const media = ref(createTestMedia())
      const { timeRange } = useTimelineWithSameEvents(events, media)

      expect(timeRange.value.minYear).toBe(-221)
      expect(timeRange.value.maxYear).toBe(184)
    })

    it('紀元前（負の値）を正しく処理する', () => {
      const events = ref<ExtendedHistoryEvent[]>([
        {
          id: '1',
          year: -500,
          yearDisplay: '前500年',
          era: '春秋',
          region: 'china',
          title: 'テスト',
          description: '',
          links: [],
        },
        {
          id: '2',
          year: -100,
          yearDisplay: '前100年',
          era: '前漢',
          region: 'china',
          title: 'テスト2',
          description: '',
          links: [],
        },
      ])
      const media = ref<MediaItem[]>([])
      const { timeRange } = useTimelineWithSameEvents(events, media)

      expect(timeRange.value.minYear).toBe(-500)
      expect(timeRange.value.maxYear).toBe(-100)
    })

    it('空配列の場合は0を返す', () => {
      const events = ref<ExtendedHistoryEvent[]>([])
      const media = ref<MediaItem[]>([])
      const { timeRange } = useTimelineWithSameEvents(events, media)

      expect(timeRange.value.minYear).toBe(0)
      expect(timeRange.value.maxYear).toBe(0)
    })
  })

  describe('yearToPosition / positionToYear（座標変換）', () => {
    it('年をピクセル位置に変換する', () => {
      const events = ref(createTestEvents())
      const media = ref(createTestMedia())
      const { yearToPosition } = useTimelineWithSameEvents(events, media)

      // minYear = -221, 1年あたり2ピクセル
      const position = yearToPosition(-221)
      expect(position).toBe(0)

      const position2 = yearToPosition(-121)
      expect(position2).toBe(200) // (-121 - -221) * 2 = 100 * 2 = 200
    })

    it('positionToYearはyearToPositionの逆変換', () => {
      const events = ref(createTestEvents())
      const media = ref(createTestMedia())
      const { yearToPosition, positionToYear } = useTimelineWithSameEvents(events, media)

      const year = -200
      const position = yearToPosition(year)
      const restoredYear = positionToYear(position)
      expect(restoredYear).toBe(year)
    })
  })

  describe('eraLanes（時代レーンデータ）', () => {
    it('時代ごとにグループ化される', () => {
      const events = ref(createTestEvents())
      const media = ref(createTestMedia())
      const { eraLanes } = useTimelineWithSameEvents(events, media)

      // 秦、楚漢戦争、前漢、後漢末の4つ
      expect(eraLanes.value.length).toBeGreaterThanOrEqual(4)
    })

    it('各時代の年代範囲が正しく計算される', () => {
      const events = ref<ExtendedHistoryEvent[]>([
        {
          id: '1',
          year: -221,
          yearDisplay: '',
          era: '秦',
          region: 'china',
          title: '',
          description: '',
          links: [],
        },
        {
          id: '2',
          year: -206,
          yearDisplay: '',
          era: '秦',
          region: 'china',
          title: '',
          description: '',
          links: [],
        },
      ])
      const media = ref<MediaItem[]>([])
      const { eraLanes } = useTimelineWithSameEvents(events, media)

      const qinLane = eraLanes.value.find((l) => l.era === '秦')
      expect(qinLane?.startYear).toBe(-221)
      expect(qinLane?.endYear).toBe(-206)
    })

    it('地域順でソートされる', () => {
      const events = ref<ExtendedHistoryEvent[]>([
        {
          id: '1',
          year: 100,
          yearDisplay: '',
          era: 'Test',
          region: 'europe',
          title: '',
          description: '',
          links: [],
        },
        {
          id: '2',
          year: 100,
          yearDisplay: '',
          era: 'Test2',
          region: 'china',
          title: '',
          description: '',
          links: [],
        },
      ])
      const media = ref<MediaItem[]>([])
      const { eraLanes } = useTimelineWithSameEvents(events, media)

      // china (order: 0) が europe (order: 2) より前
      expect(eraLanes.value[0]?.region).toBe('china')
      expect(eraLanes.value[1]?.region).toBe('europe')
    })
  })

  describe('personLanes（人物レーンデータ）', () => {
    it('人物を抽出する', () => {
      const events = ref(createTestEvents())
      const media = ref(createTestMedia())
      const { personLanes } = useTimelineWithSameEvents(events, media)

      expect(personLanes.value.length).toBeGreaterThan(0)
    })

    it('同一人物は1つにまとまる', () => {
      const events = ref<ExtendedHistoryEvent[]>([
        {
          id: '1',
          year: 100,
          yearDisplay: '',
          era: '',
          region: 'china',
          title: '',
          description: '',
          links: [],
          persons: [{ name: '共通人物', birthYear: 0, deathYear: 50 }],
        },
        {
          id: '2',
          year: 200,
          yearDisplay: '',
          era: '',
          region: 'china',
          title: '',
          description: '',
          links: [],
          persons: [{ name: '共通人物', birthYear: 0, deathYear: 50 }],
        },
      ])
      const media = ref<MediaItem[]>([])
      const { personLanes } = useTimelineWithSameEvents(events, media)

      const sharedPerson = personLanes.value.filter((p) => p.person.name === '共通人物')
      expect(sharedPerson.length).toBe(1)
      expect(sharedPerson[0]?.relatedEventIds).toContain('1')
      expect(sharedPerson[0]?.relatedEventIds).toContain('2')
    })
  })

  describe('mediaLanes（作品レーンデータ）', () => {
    it('メディアを取得する', () => {
      const events = ref(createTestEvents())
      const media = ref(createTestMedia())
      const { mediaLanes } = useTimelineWithSameEvents(events, media)

      expect(mediaLanes.value.length).toBe(2)
    })

    it('メディアがない場合は空配列', () => {
      const events = ref(createTestEvents())
      const media = ref<MediaItem[]>([])
      const { mediaLanes } = useTimelineWithSameEvents(events, media)

      expect(mediaLanes.value.length).toBe(0)
    })

    it('メディア情報が正しく含まれる', () => {
      const events = ref(createTestEvents())
      const media = ref(createTestMedia())
      const { mediaLanes } = useTimelineWithSameEvents(events, media)

      const kingdom = mediaLanes.value.find((l) => l.media.title === 'キングダム')
      expect(kingdom).toBeDefined()
      expect(kingdom?.media.type).toBe('manga')
      expect(kingdom?.media.coverageStartYear).toBe(-259)
      expect(kingdom?.media.coverageEndYear).toBe(-221)
    })
  })

  describe('eventMarkers（イベントマーカー）', () => {
    it('各イベントのマーカーデータを生成する', () => {
      const events = ref(createTestEvents())
      const media = ref(createTestMedia())
      const { eventMarkers } = useTimelineWithSameEvents(events, media)

      expect(eventMarkers.value.length).toBe(4)
    })

    it('ポジションが計算される', () => {
      const events = ref(createTestEvents())
      const media = ref(createTestMedia())
      const { eventMarkers, yearToPosition } = useTimelineWithSameEvents(events, media)

      const marker = eventMarkers.value.find((m) => m.event.id === '1')
      expect(marker?.position).toBe(yearToPosition(-221))
    })

    it('レーンインデックスが割り当てられる', () => {
      const events = ref(createTestEvents())
      const media = ref(createTestMedia())
      const { eventMarkers } = useTimelineWithSameEvents(events, media)

      eventMarkers.value.forEach((marker) => {
        expect(marker.laneIndex).toBeGreaterThanOrEqual(0)
      })
    })
  })
})
