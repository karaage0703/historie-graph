import type { HistoryEvent, MediaItem, Idiom } from './index'

// =============================================================================
// 拡張データモデル (Requirements 7.1-7.5)
// =============================================================================

/**
 * 人物情報を表す型
 * Requirements: 7.1, 7.2
 */
export interface Person {
  name: string
  birthYear: number
  deathYear: number
  description?: string
}

/**
 * 拡張されたHistoryEvent型
 * Requirements: 7.1, 7.5
 */
export interface ExtendedHistoryEvent extends HistoryEvent {
  persons?: Person[]
}

/**
 * アプリケーション設定（拡張）
 * Requirements: 6.1, 6.3
 */
export interface AppSettings {
  affiliateTag?: string
}

// =============================================================================
// タイムラインレーンデータ型 (Requirements 1.1, 2.1, 3.1, 4.1)
// =============================================================================

/**
 * 時代レーンデータ
 * Requirements: 2.1-2.4
 */
export interface EraLaneData {
  era: string
  region: string
  startYear: number
  endYear: number
  duration: number
  events: ExtendedHistoryEvent[]
  laneIndex: number
}

/**
 * 国ごとの時代レーンデータグループ
 */
export interface RegionEraGroup {
  region: string
  regionLabel: string
  lanes: EraLaneData[]
}

/**
 * 人物レーンデータ
 * Requirements: 3.1-3.3
 */
export interface PersonLaneData {
  person: Person
  relatedEventIds: string[]
}

/**
 * 作品レーンデータ
 * Requirements: 4.1-4.3
 */
export interface MediaLaneData {
  media: MediaItem
}

/**
 * イベントマーカーデータ
 * Requirements: 1.1
 */
export interface EventMarkerData {
  event: ExtendedHistoryEvent
  position: number
  laneIndex: number
}

/**
 * タイムラインの年代範囲
 */
export interface TimeRange {
  minYear: number
  maxYear: number
}

/**
 * 表示中の年代範囲
 */
export interface VisibleYearRange {
  start: number
  end: number
}

/**
 * ズーム・パン状態
 */
export interface ZoomPanState {
  scale: number
  offsetX: number
}

// =============================================================================
// COTEN RADIO データ型
// =============================================================================

/**
 * COTEN RADIOシリーズデータ
 */
export interface CotenRadioSeries {
  id: string
  seriesNumber: number
  title: string
  subtitle: string
  region: string
  era: string
  coverageStartYear: number
  coverageEndYear: number
  episodeCount: number
  spotifyUrl: string
  type?: 'short'
}

/**
 * COTEN RADIOデータ全体
 */
export interface CotenRadioData {
  podcast: {
    name: string
    description: string
    spotifyUrl: string
    applePodcastUrl: string
  }
  series: CotenRadioSeries[]
}

/**
 * Podcastレーンデータ
 */
export interface PodcastLaneData {
  series: CotenRadioSeries
  laneIndex: number
}

// =============================================================================
// 故事成語データ型
// =============================================================================

/**
 * 故事成語レーンデータ
 */
export interface IdiomLaneData {
  idiom: Idiom
  laneIndex: number
}
