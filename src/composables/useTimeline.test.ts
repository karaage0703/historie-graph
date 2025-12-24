import { describe, it, expect } from 'vitest'
import { useTimeline } from './useTimeline'
import { ref } from 'vue'
import type { ExtendedHistoryEvent } from '@/types/timeline'

describe('useTimeline', () => {
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
      media: [
        {
          title: 'キングダム',
          type: 'manga',
          remark: '',
          coverageStartYear: -259,
          coverageEndYear: -221,
          kindleUrl: 'https://amazon.co.jp/dp/B00XXX',
        },
      ],
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
      media: [],
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
      media: [
        {
          title: '項羽と劉邦',
          type: 'novel',
          remark: '',
          coverageStartYear: -232,
          coverageEndYear: -195,
        },
      ],
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
      media: [],
    },
  ]

  describe('timeRange（年代範囲算出）', () => {
    it('全イベントの最小年と最大年を計算する', () => {
      const events = ref(createTestEvents())
      const { timeRange } = useTimeline(events)

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
          media: [],
        },
        {
          id: '2',
          year: -200,
          yearDisplay: '前200年',
          era: '漢',
          region: 'china',
          title: 'テスト2',
          description: '',
          links: [],
          media: [],
        },
      ])
      const { timeRange } = useTimeline(events)

      expect(timeRange.value.minYear).toBe(-500)
      expect(timeRange.value.maxYear).toBe(-200)
    })

    it('空の配列の場合はデフォルト範囲を返す', () => {
      const events = ref<ExtendedHistoryEvent[]>([])
      const { timeRange } = useTimeline(events)

      expect(timeRange.value.minYear).toBe(0)
      expect(timeRange.value.maxYear).toBe(0)
    })
  })

  describe('yearToPosition（年→ピクセル変換）', () => {
    it('年をピクセル位置に変換する', () => {
      const events = ref(createTestEvents())
      const { yearToPosition, timeRange } = useTimeline(events)

      // 最小年が0になる
      const minPos = yearToPosition(timeRange.value.minYear)
      expect(minPos).toBe(0)

      // 最大年が幅いっぱいになる
      const maxPos = yearToPosition(timeRange.value.maxYear)
      expect(maxPos).toBeGreaterThan(0)
    })

    it('紀元前から紀元後まで連続的に変換できる', () => {
      const events = ref(createTestEvents())
      const { yearToPosition } = useTimeline(events)

      const posBefore = yearToPosition(-100)
      const posAfter = yearToPosition(100)

      expect(posAfter).toBeGreaterThan(posBefore)
    })
  })

  describe('positionToYear（ピクセル→年変換）', () => {
    it('ピクセル位置を年に逆変換できる', () => {
      const events = ref(createTestEvents())
      const { yearToPosition, positionToYear } = useTimeline(events)

      const year = -100
      const position = yearToPosition(year)
      const convertedYear = positionToYear(position)

      expect(Math.round(convertedYear)).toBe(year)
    })
  })

  describe('eraLanes（時代レーンデータ）', () => {
    it('同一時代のイベントをグループ化する', () => {
      const events = ref(createTestEvents())
      const { eraLanes } = useTimeline(events)

      const eras = eraLanes.value.map((lane) => lane.era)
      expect(eras).toContain('秦')
      expect(eras).toContain('楚漢戦争')
      expect(eras).toContain('前漢')
      expect(eras).toContain('後漢末')
    })

    it('各時代の開始年・終了年・継続年数を算出する', () => {
      const events = ref<ExtendedHistoryEvent[]>([
        {
          id: '1',
          year: -221,
          yearDisplay: '前221年',
          era: '秦',
          region: 'china',
          title: 'テスト1',
          description: '',
          links: [],
          media: [],
        },
        {
          id: '2',
          year: -210,
          yearDisplay: '前210年',
          era: '秦',
          region: 'china',
          title: 'テスト2',
          description: '',
          links: [],
          media: [],
        },
        {
          id: '3',
          year: -206,
          yearDisplay: '前206年',
          era: '秦',
          region: 'china',
          title: 'テスト3',
          description: '',
          links: [],
          media: [],
        },
      ])
      const { eraLanes } = useTimeline(events)

      const qinLane = eraLanes.value.find((lane) => lane.era === '秦')
      expect(qinLane).toBeDefined()
      if (!qinLane) throw new Error('qinLane not found')
      expect(qinLane.startYear).toBe(-221)
      expect(qinLane.endYear).toBe(-206)
      expect(qinLane.duration).toBe(15)
    })

    it('時代にはその時代のイベントが含まれる', () => {
      const events = ref(createTestEvents())
      const { eraLanes } = useTimeline(events)

      const qinLane = eraLanes.value.find((lane) => lane.era === '秦')
      if (!qinLane) throw new Error('qinLane not found')
      expect(qinLane.events).toHaveLength(1)
      expect(qinLane.events[0]!.title).toBe('秦の統一')
    })

    it('レーンインデックスが割り当てられる', () => {
      const events = ref(createTestEvents())
      const { eraLanes } = useTimeline(events)

      eraLanes.value.forEach((lane) => {
        expect(lane.laneIndex).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe('personLanes（人物レーンデータ）', () => {
    it('イベントに紐づく人物情報を抽出する', () => {
      const events = ref(createTestEvents())
      const { personLanes } = useTimeline(events)

      const personNames = personLanes.value.map((lane) => lane.person.name)
      expect(personNames).toContain('始皇帝')
      expect(personNames).toContain('李斯')
      expect(personNames).toContain('項羽')
      expect(personNames).toContain('劉邦')
    })

    it('人物の生年から没年までの期間データを保持する', () => {
      const events = ref(createTestEvents())
      const { personLanes } = useTimeline(events)

      const emperor = personLanes.value.find(
        (lane) => lane.person.name === '始皇帝'
      )
      if (!emperor) throw new Error('emperor not found')
      expect(emperor.person.birthYear).toBe(-259)
      expect(emperor.person.deathYear).toBe(-210)
    })

    it('関連イベントIDとの紐付けを保持する', () => {
      const events = ref(createTestEvents())
      const { personLanes } = useTimeline(events)

      const emperor = personLanes.value.find(
        (lane) => lane.person.name === '始皇帝'
      )
      if (!emperor) throw new Error('emperor not found')
      expect(emperor.relatedEventIds).toContain('1')
    })

    it('同一人物が複数イベントに登場する場合は1つにまとめる', () => {
      const events = ref<ExtendedHistoryEvent[]>([
        {
          id: '1',
          year: -221,
          yearDisplay: '',
          era: '秦',
          region: 'china',
          title: 'A',
          description: '',
          links: [],
          media: [],
          persons: [{ name: '始皇帝', birthYear: -259, deathYear: -210 }],
        },
        {
          id: '2',
          year: -210,
          yearDisplay: '',
          era: '秦',
          region: 'china',
          title: 'B',
          description: '',
          links: [],
          media: [],
          persons: [{ name: '始皇帝', birthYear: -259, deathYear: -210 }],
        },
      ])
      const { personLanes } = useTimeline(events)

      const emperors = personLanes.value.filter(
        (lane) => lane.person.name === '始皇帝'
      )
      expect(emperors).toHaveLength(1)
      expect(emperors[0]?.relatedEventIds).toEqual(['1', '2'])
    })
  })

  describe('mediaLanes（作品レーンデータ）', () => {
    it('各作品のカバー範囲を期間データに変換する', () => {
      const events = ref(createTestEvents())
      const { mediaLanes } = useTimeline(events)

      const kingdom = mediaLanes.value.find(
        (lane) => lane.media.title === 'キングダム'
      )
      expect(kingdom).toBeDefined()
      if (!kingdom) throw new Error('kingdom not found')
      expect(kingdom.media.coverageStartYear).toBe(-259)
      expect(kingdom.media.coverageEndYear).toBe(-221)
    })

    it('メディアタイプ情報を保持する', () => {
      const events = ref(createTestEvents())
      const { mediaLanes } = useTimeline(events)

      const kingdom = mediaLanes.value.find(
        (lane) => lane.media.title === 'キングダム'
      )
      if (!kingdom) throw new Error('kingdom not found')
      expect(kingdom.media.type).toBe('manga')
    })

    it('親イベントIDとの紐付けを維持する', () => {
      const events = ref(createTestEvents())
      const { mediaLanes } = useTimeline(events)

      const kingdom = mediaLanes.value.find(
        (lane) => lane.media.title === 'キングダム'
      )
      if (!kingdom) throw new Error('kingdom not found')
      expect(kingdom.parentEventId).toBe('1')
    })

    it('カバー範囲が未設定の作品も含める', () => {
      const events = ref<ExtendedHistoryEvent[]>([
        {
          id: '1',
          year: 184,
          yearDisplay: '',
          era: '三国',
          region: 'china',
          title: 'テスト',
          description: '',
          links: [],
          media: [{ title: '三国志', type: 'manga', remark: '' }],
        },
      ])
      const { mediaLanes } = useTimeline(events)

      expect(mediaLanes.value).toHaveLength(1)
      expect(mediaLanes.value[0]?.media.coverageStartYear).toBeUndefined()
    })
  })

  describe('eventMarkers（イベントマーカーデータ）', () => {
    it('各イベントの年を位置座標に変換する', () => {
      const events = ref(createTestEvents())
      const { eventMarkers } = useTimeline(events)

      expect(eventMarkers.value.length).toBe(4)
      eventMarkers.value.forEach((marker) => {
        expect(marker.position).toBeGreaterThanOrEqual(0)
      })
    })

    it('マーカー表示に必要なイベント情報を保持する', () => {
      const events = ref(createTestEvents())
      const { eventMarkers } = useTimeline(events)

      const firstMarker = eventMarkers.value.find((m) => m.event.id === '1')
      if (!firstMarker) throw new Error('firstMarker not found')
      expect(firstMarker.event.title).toBe('秦の統一')
      expect(firstMarker.event.year).toBe(-221)
    })

    it('年代順に並べられる', () => {
      const events = ref(createTestEvents())
      const { eventMarkers } = useTimeline(events)

      for (let i = 1; i < eventMarkers.value.length; i++) {
        const current = eventMarkers.value[i]
        const prev = eventMarkers.value[i - 1]
        if (!current || !prev) continue
        expect(current.event.year).toBeGreaterThanOrEqual(prev.event.year)
      }
    })
  })
})
