<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown, ChevronUp, MapPin, Calendar, ExternalLink } from 'lucide-vue-next'
import type { HistoryEvent } from '@/types'
import MediaBadge from './MediaBadge.vue'

defineProps<{
  event: HistoryEvent
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
      class="flex w-full items-start justify-between gap-4 p-4 text-left"
      @click="isExpanded = !isExpanded"
    >
      <div class="flex-1">
        <div class="mb-2 flex flex-wrap items-center gap-2">
          <span
            class="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-0.5 text-sm font-medium text-blue-800"
          >
            <Calendar class="h-3.5 w-3.5" />
            {{ event.yearDisplay }}
          </span>
          <span class="rounded-md bg-gray-100 px-2 py-0.5 text-sm text-gray-700">
            {{ event.era }}
          </span>
          <span
            class="inline-flex items-center gap-1 rounded-md bg-green-100 px-2 py-0.5 text-sm text-green-800"
          >
            <MapPin class="h-3.5 w-3.5" />
            {{ regionLabels[event.region] || event.region }}
          </span>
        </div>
        <h3 class="text-lg font-semibold text-gray-900">{{ event.title }}</h3>
      </div>
      <ChevronUp v-if="isExpanded" class="h-5 w-5 flex-shrink-0 text-gray-400" />
      <ChevronDown v-else class="h-5 w-5 flex-shrink-0 text-gray-400" />
    </button>

    <div v-if="isExpanded" class="border-t border-gray-100 px-4 pb-4 pt-3">
      <p class="mb-4 text-gray-700">{{ event.description }}</p>

      <div v-if="event.links && event.links.length > 0" class="mb-4">
        <h4 class="mb-2 text-sm font-medium text-gray-900">参考リンク</h4>
        <ul class="space-y-1">
          <li v-for="(link, index) in event.links" :key="index">
            <a
              :href="link"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
            >
              <ExternalLink class="h-3.5 w-3.5" />
              {{ link }}
            </a>
          </li>
        </ul>
      </div>

      <div v-if="event.media && event.media.length > 0">
        <h4 class="mb-2 text-sm font-medium text-gray-900">関連メディア</h4>
        <div class="flex flex-wrap gap-2">
          <MediaBadge
            v-for="(media, index) in event.media"
            :key="index"
            :type="media.type"
            :title="media.title"
            :remark="media.remark"
          />
        </div>
      </div>

      <div v-if="(!event.media || event.media.length === 0) && (!event.links || event.links.length === 0)">
        <p class="text-sm text-gray-500">追加情報はありません</p>
      </div>
    </div>
  </div>
</template>
