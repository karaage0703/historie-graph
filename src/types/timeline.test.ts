import { describe, it, expect } from 'vitest'
import type {
  Person,
  ExtendedHistoryEvent,
  AppSettings,
  EraLaneData,
  PersonLaneData,
  MediaLaneData,
  EventMarkerData,
  TimeRange,
} from './timeline'
import type { MediaItem } from './index'

describe('Timeline Types', () => {
  describe('Person型', () => {
    it('人物の名前、生年、没年を持つ', () => {
      const person: Person = {
        name: '曹操',
        birthYear: 155,
        deathYear: 220,
      }
      expect(person.name).toBe('曹操')
      expect(person.birthYear).toBe(155)
      expect(person.deathYear).toBe(220)
    })

    it('説明フィールドはオプショナル', () => {
      const personWithDesc: Person = {
        name: '劉備',
        birthYear: 161,
        deathYear: 223,
        description: '蜀漢の初代皇帝',
      }
      expect(personWithDesc.description).toBe('蜀漢の初代皇帝')

      const personWithoutDesc: Person = {
        name: '孫権',
        birthYear: 182,
        deathYear: 252,
      }
      expect(personWithoutDesc.description).toBeUndefined()
    })

    it('紀元前の年を負の値で表現できる', () => {
      const person: Person = {
        name: '始皇帝',
        birthYear: -259,
        deathYear: -210,
      }
      expect(person.birthYear).toBe(-259)
      expect(person.deathYear).toBe(-210)
    })
  })

  describe('MediaItem型', () => {
    it('id, title, type, remark, relatedEventIdsを持つ', () => {
      const media: MediaItem = {
        id: 'kingdom',
        title: 'キングダム',
        type: 'manga',
        remark: '原泰久による漫画',
        relatedEventIds: ['event-1'],
      }
      expect(media.id).toBe('kingdom')
      expect(media.title).toBe('キングダム')
      expect(media.type).toBe('manga')
      expect(media.remark).toBe('原泰久による漫画')
      expect(media.relatedEventIds).toContain('event-1')
    })

    it('カバー範囲（開始年・終了年）を持てる', () => {
      const media: MediaItem = {
        id: 'kingdom',
        title: 'キングダム',
        type: 'manga',
        remark: '',
        coverageStartYear: -259,
        coverageEndYear: -221,
        relatedEventIds: [],
      }
      expect(media.coverageStartYear).toBe(-259)
      expect(media.coverageEndYear).toBe(-221)
    })

    it('KindleURLを持てる', () => {
      const media: MediaItem = {
        id: 'sangokushi',
        title: '三国志',
        type: 'manga',
        remark: '',
        kindleUrl: 'https://www.amazon.co.jp/dp/B00X1234',
        relatedEventIds: [],
      }
      expect(media.kindleUrl).toBe('https://www.amazon.co.jp/dp/B00X1234')
    })

    it('coverageStartYear, coverageEndYear, kindleUrlはオプショナル', () => {
      const media: MediaItem = {
        id: 'kouuryuuhou',
        title: '項羽と劉邦',
        type: 'novel',
        remark: '',
        relatedEventIds: [],
      }
      expect(media.coverageStartYear).toBeUndefined()
      expect(media.coverageEndYear).toBeUndefined()
      expect(media.kindleUrl).toBeUndefined()
    })

    it('複数のイベントに関連付けできる', () => {
      const media: MediaItem = {
        id: 'kouuryuuhou',
        title: '項羽と劉邦',
        type: 'novel',
        remark: '',
        relatedEventIds: ['event-1', 'event-2', 'event-3'],
      }
      expect(media.relatedEventIds).toHaveLength(3)
    })
  })

  describe('ExtendedHistoryEvent型', () => {
    it('既存HistoryEventのフィールドを持つ', () => {
      const event: ExtendedHistoryEvent = {
        id: '1',
        year: 184,
        yearDisplay: '184年',
        era: '後漢末',
        region: 'china',
        title: '黄巾の乱',
        description: '太平道による農民反乱',
        links: [],
      }
      expect(event.id).toBe('1')
      expect(event.year).toBe(184)
      expect(event.era).toBe('後漢末')
    })

    it('関連人物リストを持てる', () => {
      const event: ExtendedHistoryEvent = {
        id: '1',
        year: 208,
        yearDisplay: '208年',
        era: '三国',
        region: 'china',
        title: '赤壁の戦い',
        description: '孫権・劉備連合軍vs曹操軍',
        links: [],
        persons: [
          { name: '曹操', birthYear: 155, deathYear: 220 },
          { name: '周瑜', birthYear: 175, deathYear: 210 },
        ],
      }
      expect(event.persons).toHaveLength(2)
      expect(event.persons?.[0]?.name).toBe('曹操')
    })

    it('personsフィールドはオプショナル（後方互換性）', () => {
      const event: ExtendedHistoryEvent = {
        id: '1',
        year: 220,
        yearDisplay: '220年',
        era: '三国',
        region: 'china',
        title: '曹丕が魏を建国',
        description: '',
        links: [],
      }
      expect(event.persons).toBeUndefined()
    })
  })

  describe('AppSettings型', () => {
    it('アフィリエイトタグを持てる', () => {
      const settings: AppSettings = {
        affiliateTag: 'example-22',
      }
      expect(settings.affiliateTag).toBe('example-22')
    })

    it('アフィリエイトタグはオプショナル', () => {
      const settings: AppSettings = {}
      expect(settings.affiliateTag).toBeUndefined()
    })
  })

  describe('EraLaneData型', () => {
    it('時代の名前、地域、開始年、終了年、継続年数を持つ', () => {
      const eraLane: EraLaneData = {
        era: '秦',
        region: 'china',
        startYear: -221,
        endYear: -206,
        duration: 15,
        events: [],
        laneIndex: 0,
      }
      expect(eraLane.era).toBe('秦')
      expect(eraLane.region).toBe('china')
      expect(eraLane.startYear).toBe(-221)
      expect(eraLane.endYear).toBe(-206)
      expect(eraLane.duration).toBe(15)
    })

    it('重複時代用のレーンインデックスを持つ', () => {
      const eraLane: EraLaneData = {
        era: '楚漢戦争',
        region: 'china',
        startYear: -206,
        endYear: -202,
        duration: 4,
        events: [],
        laneIndex: 1,
      }
      expect(eraLane.laneIndex).toBe(1)
    })
  })

  describe('PersonLaneData型', () => {
    it('人物情報と関連イベントIDを持つ', () => {
      const personLane: PersonLaneData = {
        person: {
          name: '項羽',
          birthYear: -232,
          deathYear: -202,
        },
        relatedEventIds: ['event-1', 'event-2'],
      }
      expect(personLane.person.name).toBe('項羽')
      expect(personLane.relatedEventIds).toHaveLength(2)
    })
  })

  describe('MediaLaneData型', () => {
    it('作品情報を持つ', () => {
      const mediaLane: MediaLaneData = {
        media: {
          id: 'kingdom',
          title: 'キングダム',
          type: 'manga',
          remark: '',
          coverageStartYear: -259,
          coverageEndYear: -221,
          relatedEventIds: ['event-1'],
        },
      }
      expect(mediaLane.media.title).toBe('キングダム')
      expect(mediaLane.media.id).toBe('kingdom')
      expect(mediaLane.media.relatedEventIds).toContain('event-1')
    })
  })

  describe('EventMarkerData型', () => {
    it('イベント情報と位置を持つ', () => {
      const marker: EventMarkerData = {
        event: {
          id: '1',
          year: -221,
          yearDisplay: '前221年',
          era: '秦',
          region: 'china',
          title: '秦の統一',
          description: '',
          links: [],
        },
        position: 100,
        laneIndex: 0,
      }
      expect(marker.event.year).toBe(-221)
      expect(marker.position).toBe(100)
    })
  })

  describe('TimeRange型', () => {
    it('最小年と最大年を持つ', () => {
      const range: TimeRange = {
        minYear: -221,
        maxYear: 280,
      }
      expect(range.minYear).toBe(-221)
      expect(range.maxYear).toBe(280)
    })
  })
})
