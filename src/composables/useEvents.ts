import { ref, computed } from 'vue'
import type { HistoryEvent, MediaItem } from '@/types'
import { useGithubApi } from './useGithubApi'
import { useError } from './useError'

const events = ref<HistoryEvent[]>([])
const media = ref<MediaItem[]>([])
const isLoading = ref(false)

export function useEvents() {
  const { fetchData, saveData, isSaving } = useGithubApi()
  const { setNetworkError, setApiError, clearError } = useError()

  const sortedEvents = computed(() => {
    return [...events.value].sort((a, b) => a.year - b.year)
  })

  const sortedMedia = computed(() => {
    return [...media.value].sort((a, b) => (a.coverageStartYear ?? 0) - (b.coverageStartYear ?? 0))
  })

  async function fetchEvents(): Promise<void> {
    isLoading.value = true
    clearError()

    try {
      const data = await fetchData()
      events.value = data.events
      media.value = data.media ?? []
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setNetworkError()
      } else {
        setApiError(
          error instanceof Error ? error.message : 'データの取得に失敗しました',
          error
        )
      }
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function addEvent(event: Omit<HistoryEvent, 'id'>): Promise<void> {
    const newEvent: HistoryEvent = {
      ...event,
      id: crypto.randomUUID(),
    }

    events.value = [...events.value, newEvent]

    const result = await saveData(events.value, media.value)
    if (!result.success) {
      events.value = events.value.filter((e) => e.id !== newEvent.id)
      throw new Error(result.error?.message || '保存に失敗しました')
    }
  }

  async function updateEvent(
    id: string,
    updates: Partial<Omit<HistoryEvent, 'id'>>
  ): Promise<void> {
    const originalEvent = events.value.find((e) => e.id === id)
    if (!originalEvent) {
      throw new Error('イベントが見つかりません')
    }

    const originalEvents = [...events.value]
    const updatedEvent: HistoryEvent = {
      id: originalEvent.id,
      year: updates.year ?? originalEvent.year,
      yearDisplay: updates.yearDisplay ?? originalEvent.yearDisplay,
      era: updates.era ?? originalEvent.era,
      region: updates.region ?? originalEvent.region,
      title: updates.title ?? originalEvent.title,
      description: updates.description ?? originalEvent.description,
      links: updates.links ?? originalEvent.links,
    }

    events.value = events.value.map((e) => (e.id === id ? updatedEvent : e))

    const result = await saveData(events.value, media.value)
    if (!result.success) {
      events.value = originalEvents
      throw new Error(result.error?.message || '更新に失敗しました')
    }
  }

  async function deleteEvent(id: string): Promise<void> {
    const index = events.value.findIndex((e) => e.id === id)
    if (index === -1) {
      throw new Error('イベントが見つかりません')
    }

    const originalEvents = [...events.value]
    events.value = events.value.filter((e) => e.id !== id)

    const result = await saveData(events.value, media.value)
    if (!result.success) {
      events.value = originalEvents
      throw new Error(result.error?.message || '削除に失敗しました')
    }
  }

  async function addMedia(newMedia: Omit<MediaItem, 'id'>): Promise<void> {
    const mediaItem: MediaItem = {
      ...newMedia,
      id: crypto.randomUUID(),
    }

    media.value = [...media.value, mediaItem]

    const result = await saveData(events.value, media.value)
    if (!result.success) {
      media.value = media.value.filter((m) => m.id !== mediaItem.id)
      throw new Error(result.error?.message || '保存に失敗しました')
    }
  }

  async function removeMedia(mediaId: string): Promise<void> {
    const originalMedia = [...media.value]
    media.value = media.value.filter((m) => m.id !== mediaId)

    const result = await saveData(events.value, media.value)
    if (!result.success) {
      media.value = originalMedia
      throw new Error(result.error?.message || '削除に失敗しました')
    }
  }

  return {
    events,
    media,
    isLoading,
    isSaving,
    sortedEvents,
    sortedMedia,
    fetchEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    addMedia,
    removeMedia,
  }
}
