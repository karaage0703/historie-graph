<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue'
import { Clock, LayoutGrid, GitBranch } from 'lucide-vue-next'
import { useEvents } from '@/composables/useEvents'
import { useFilters } from '@/composables/useFilters'
import EventCard from '@/components/EventCard.vue'
import FilterBar from '@/components/FilterBar.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'
import { TimelineCanvas } from '@/components/timeline'
import type { ExtendedHistoryEvent } from '@/types/timeline'

const { sortedEvents, sortedMedia, sortedIdioms, isLoading, fetchEvents } = useEvents()
const { filteredEvents, filteredMedia, initializeDefaultYearRange } = useFilters()

// 表示モード: 'card' または 'timeline'
const viewMode = ref<'card' | 'timeline'>('timeline')

const displayEvents = computed(() => filteredEvents(sortedEvents.value))
const displayMedia = computed(() => filteredMedia(sortedMedia.value))

// データ読み込み後にデフォルト年代範囲を初期化
watch([sortedEvents, sortedMedia], ([events, media]) => {
  if (events.length > 0 || media.length > 0) {
    initializeDefaultYearRange(events, media)
  }
}, { immediate: true })

// ExtendedHistoryEventに変換（フィルタ済み）
const extendedEvents = computed<ExtendedHistoryEvent[]>(() => {
  return displayEvents.value.map((event) => ({
    ...event,
    // personsは既存データにはないのでundefined
  }))
})

// 全イベント（時代レーン計算用）
const allExtendedEvents = computed<ExtendedHistoryEvent[]>(() => {
  return sortedEvents.value.map((event) => ({
    ...event,
  }))
})

// イベントに関連するメディアを取得
const getRelatedMedia = (eventId: string) => {
  return sortedMedia.value.filter((m) => m.relatedEventIds.includes(eventId))
}

onMounted(() => {
  fetchEvents()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-4 sm:py-8">
    <div class="mx-auto px-4" :class="viewMode === 'timeline' ? 'max-w-7xl' : 'max-w-4xl'">
      <div class="mb-4 flex items-center justify-between sm:mb-8">
        <div class="flex items-center gap-2 sm:gap-3">
          <Clock class="h-6 w-6 text-gray-700 sm:h-8 sm:w-8" />
          <h1 class="text-xl font-bold text-gray-900 sm:text-2xl">タイムライン</h1>
        </div>

        <!-- 表示モード切り替え -->
        <div class="flex rounded-lg border border-gray-300 bg-white">
          <button
            class="flex items-center gap-1 rounded-l-lg px-3 py-1.5 text-sm transition-colors"
            :class="viewMode === 'card' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'"
            @click="viewMode = 'card'"
          >
            <LayoutGrid class="h-4 w-4" />
            <span class="hidden sm:inline">カード</span>
          </button>
          <button
            class="flex items-center gap-1 rounded-r-lg px-3 py-1.5 text-sm transition-colors"
            :class="viewMode === 'timeline' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'"
            @click="viewMode = 'timeline'"
          >
            <GitBranch class="h-4 w-4" />
            <span class="hidden sm:inline">年表</span>
          </button>
        </div>
      </div>

      <ErrorMessage :on-retry="fetchEvents" />

      <LoadingSpinner v-if="isLoading" message="データを読み込み中..." />

      <template v-else>
        <FilterBar :events="sortedEvents" class="mb-4 sm:mb-6" />

        <div v-if="displayEvents.length === 0" class="rounded-lg bg-white p-6 text-center shadow sm:p-8">
          <p class="text-sm text-gray-600 sm:text-base">表示するイベントがありません</p>
        </div>

        <!-- カード表示 -->
        <div v-else-if="viewMode === 'card'" class="space-y-3 sm:space-y-4">
          <EventCard
            v-for="event in displayEvents"
            :key="event.id"
            :event="event"
            :related-media="getRelatedMedia(event.id)"
          />
        </div>

        <!-- タイムライン表示 -->
        <div v-else class="rounded-lg bg-white p-4 shadow sm:p-6">
          <TimelineCanvas
            :events="extendedEvents"
            :all-events="allExtendedEvents"
            :media="displayMedia"
            :all-media="sortedMedia"
            :idioms="sortedIdioms"
          />
        </div>
      </template>
    </div>
  </div>
</template>
