<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown, ChevronUp, MapPin, Calendar, ExternalLink } from 'lucide-vue-next'
import type { HistoryEvent, MediaItem } from '@/types'
import MediaBadge from './MediaBadge.vue'

defineProps<{
  event: HistoryEvent
  relatedMedia?: MediaItem[]
}>()

const isExpanded = ref(false)

const regionLabels: Record<string, string> = {
  china: '中国',
  japan: '日本',
  europe: 'ヨーロッパ',
  middle_east: '中東',
  other: 'その他',
}
</script>

<template>
  <div
    class="rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md"
    :class="isExpanded ? 'border-blue-200' : 'border-gray-200'"
  >
    <button
      type="button"
      class="flex w-full items-start justify-between gap-2 p-3 text-left sm:gap-4 sm:p-4"
      @click="isExpanded = !isExpanded"
    >
      <div class="min-w-0 flex-1">
        <div class="mb-1.5 flex flex-wrap items-center gap-1 sm:mb-2 sm:gap-2">
          <span
            class="inline-flex items-center gap-1 rounded-md bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800 sm:px-2 sm:text-sm"
          >
            <Calendar class="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            {{ event.yearDisplay }}
          </span>
          <span class="rounded-md bg-gray-100 px-1.5 py-0.5 text-xs text-gray-700 sm:px-2 sm:text-sm">
            {{ event.era }}
          </span>
          <span
            class="inline-flex items-center gap-1 rounded-md bg-green-100 px-1.5 py-0.5 text-xs text-green-800 sm:px-2 sm:text-sm"
          >
            <MapPin class="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            {{ regionLabels[event.region] || event.region }}
          </span>
        </div>
        <h3 class="text-base font-semibold text-gray-900 sm:text-lg">{{ event.title }}</h3>
      </div>
      <ChevronUp v-if="isExpanded" class="h-5 w-5 flex-shrink-0 text-gray-400" />
      <ChevronDown v-else class="h-5 w-5 flex-shrink-0 text-gray-400" />
    </button>

    <div v-if="isExpanded" class="border-t border-gray-100 px-3 pb-3 pt-2 sm:px-4 sm:pb-4 sm:pt-3">
      <p class="mb-3 text-sm text-gray-700 sm:mb-4 sm:text-base">{{ event.description }}</p>

      <div v-if="event.links && event.links.length > 0" class="mb-3 sm:mb-4">
        <h4 class="mb-1.5 text-sm font-medium text-gray-900 sm:mb-2">参考リンク</h4>
        <ul class="space-y-1">
          <li v-for="(link, index) in event.links" :key="index" class="min-w-0">
            <a
              :href="link"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline sm:text-sm"
            >
              <ExternalLink class="h-3 w-3 flex-shrink-0 sm:h-3.5 sm:w-3.5" />
              <span class="truncate">{{ link }}</span>
            </a>
          </li>
        </ul>
      </div>

      <div v-if="relatedMedia && relatedMedia.length > 0">
        <h4 class="mb-1.5 text-sm font-medium text-gray-900 sm:mb-2">関連メディア</h4>
        <div class="flex flex-wrap gap-1.5 sm:gap-2">
          <MediaBadge
            v-for="media in relatedMedia"
            :key="media.id"
            :type="media.type"
            :title="media.title"
            :remark="media.remark"
            :kindle-url="media.kindleUrl"
          />
        </div>
      </div>

      <div v-if="(!relatedMedia || relatedMedia.length === 0) && (!event.links || event.links.length === 0)">
        <p class="text-xs text-gray-500 sm:text-sm">追加情報はありません</p>
      </div>
    </div>
  </div>
</template>
