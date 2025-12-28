export type MediaType = 'manga' | 'novel'

export type Region = 'china' | 'japan' | 'europe' | 'middle_east' | 'other'

export interface MediaItem {
  id: string
  title: string
  type: MediaType
  remark: string
  coverageStartYear?: number
  coverageEndYear?: number
  kindleUrl?: string
  relatedEventIds: string[]
}

export interface HistoryEvent {
  id: string
  year: number
  yearDisplay: string
  era: string
  region: Region
  title: string
  description: string
  links: string[]
}

/**
 * 故事成語・四字熟語
 */
export interface Idiom {
  id: string
  idiom: string
  reading: string
  meaning: string
  origin: string
  year: number
  yearDisplay: string
  era: string
  region: Region
  relatedEventIds: string[]
  relatedMediaIds: string[]
  links: string[]
}

export interface HistorieData {
  events: HistoryEvent[]
  media: MediaItem[]
  idioms: Idiom[]
}

export interface GithubSettings {
  token: string
  owner: string
  repo: string
}

export interface GithubApiError {
  code: 'UNAUTHORIZED' | 'NOT_FOUND' | 'CONFLICT' | 'RATE_LIMIT' | 'NETWORK' | 'UNKNOWN'
  message: string
  status?: number
}

export interface SaveResult {
  success: boolean
  sha?: string
  error?: GithubApiError
}

export interface AppError {
  type: 'NETWORK' | 'API' | 'VALIDATION' | 'UNKNOWN'
  message: string
  retryable: boolean
  details?: unknown
}
