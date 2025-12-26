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

export interface HistorieData {
  events: HistoryEvent[]
  media: MediaItem[]
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
