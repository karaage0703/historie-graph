<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { X, BookOpen, ExternalLink } from 'lucide-vue-next'
import { useAffiliateLink } from '@/composables/useAffiliateLink'
import MediaBadge from '@/components/MediaBadge.vue'
import type { MediaItem } from '@/types'
import type {
  EraLaneData,
  PersonLaneData,
  MediaLaneData,
  ExtendedHistoryEvent,
  PodcastLaneData,
  IdiomLaneData,
} from '@/types/timeline'

const props = defineProps<{
  type: 'era' | 'person' | 'media' | 'event' | 'podcast' | 'idiom'
  data: unknown
  x: number
  y: number
  allMedia?: MediaItem[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const popoverRef = ref<HTMLElement | null>(null)
const { generateAffiliateUrl } = useAffiliateLink()

// 型ガード
const isEra = computed(() => props.type === 'era')
const isPerson = computed(() => props.type === 'person')
const isMedia = computed(() => props.type === 'media')
const isEvent = computed(() => props.type === 'event')
const isPodcast = computed(() => props.type === 'podcast')
const isIdiom = computed(() => props.type === 'idiom')

const eraData = computed(() => (isEra.value ? (props.data as EraLaneData) : null))
const personData = computed(() => (isPerson.value ? (props.data as PersonLaneData) : null))
const mediaData = computed(() => (isMedia.value ? (props.data as MediaLaneData) : null))
const eventData = computed(() => (isEvent.value ? (props.data as ExtendedHistoryEvent) : null))
const podcastData = computed(() => (isPodcast.value ? (props.data as PodcastLaneData) : null))
const idiomData = computed(() => (isIdiom.value ? (props.data as IdiomLaneData) : null))

// Kindleリンク
const kindleUrl = computed(() => {
  if (!isMedia.value || !mediaData.value?.media.kindleUrl) return null
  return generateAffiliateUrl(mediaData.value.media.kindleUrl)
})

// イベントに関連するメディアを取得
const relatedMedia = computed(() => {
  if (!isEvent.value || !eventData.value || !props.allMedia) return []
  return props.allMedia.filter((m) => m.relatedEventIds.includes(eventData.value!.id))
})

// 特定のイベントIDに関連するメディアを取得
const getRelatedMediaForEvent = (eventId: string) => {
  if (!props.allMedia) return []
  return props.allMedia.filter((m) => m.relatedEventIds.includes(eventId))
}

// 故事成語に関連するメディアを取得
const idiomRelatedMedia = computed(() => {
  if (!isIdiom.value || !idiomData.value || !props.allMedia) return []
  const mediaIds = idiomData.value.idiom.relatedMediaIds
  return props.allMedia.filter((m) => mediaIds.includes(m.id))
})

// 年の表示
const formatYear = (year: number) => {
  return year < 0 ? `前${Math.abs(year)}年` : `${year}年`
}

// 外部クリックで閉じる
const handleClickOutside = (e: MouseEvent) => {
  if (popoverRef.value && !popoverRef.value.contains(e.target as Node)) {
    emit('close')
  }
}

// ポップオーバー位置
const style = computed(() => {
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  const popoverWidth = 300
  const popoverHeight = 200

  let left = props.x + 10
  let top = props.y + 10

  // 右端チェック
  if (left + popoverWidth > windowWidth) {
    left = props.x - popoverWidth - 10
  }

  // 下端チェック
  if (top + popoverHeight > windowHeight) {
    top = props.y - popoverHeight - 10
  }

  return {
    left: `${left}px`,
    top: `${top}px`,
  }
})

onMounted(() => {
  setTimeout(() => {
    document.addEventListener('click', handleClickOutside)
  }, 100)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div
    ref="popoverRef"
    class="fixed z-50 w-72 rounded-lg border border-gray-200 bg-white p-3 shadow-lg"
    :style="style"
  >
    <!-- ヘッダー -->
    <div class="mb-2 flex items-start justify-between">
      <h4 class="font-semibold text-gray-900">
        <template v-if="isEra">{{ eraData?.era }}</template>
        <template v-else-if="isPerson">{{ personData?.person.name }}</template>
        <template v-else-if="isMedia">{{ mediaData?.media.title }}</template>
        <template v-else-if="isEvent">{{ eventData?.title }}</template>
        <template v-else-if="isPodcast">🎙️ {{ podcastData?.series.title }}</template>
        <template v-else-if="isIdiom">📜 {{ idiomData?.idiom.idiom }}</template>
      </h4>
      <button
        class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        @click="emit('close')"
      >
        <X class="h-4 w-4" />
      </button>
    </div>

    <!-- 時代の詳細 -->
    <template v-if="isEra && eraData">
      <div class="space-y-2 text-sm text-gray-600">
        <p>
          <span class="font-medium">期間:</span>
          {{ formatYear(eraData.startYear) }} 〜 {{ formatYear(eraData.endYear) }}
        </p>
        <p>
          <span class="font-medium">継続年数:</span>
          {{ eraData.duration }}年
        </p>

        <!-- イベント一覧 -->
        <div v-if="eraData.events.length > 0" class="pt-2 border-t border-gray-100">
          <p class="font-medium text-gray-900 mb-1.5">イベント ({{ eraData.events.length }}件):</p>
          <ul class="space-y-2 max-h-48 overflow-y-auto">
            <li v-for="event in eraData.events" :key="event.id">
              <div class="text-xs">
                <span class="text-gray-500">{{ event.yearDisplay }}</span>
                <span class="ml-1 font-medium">{{ event.title }}</span>
              </div>
              <div v-if="getRelatedMediaForEvent(event.id).length > 0" class="flex flex-wrap gap-1 mt-1">
                <MediaBadge
                  v-for="media in getRelatedMediaForEvent(event.id)"
                  :key="media.id"
                  :type="media.type"
                  :title="media.title"
                  :remark="media.remark"
                  :kindle-url="media.kindleUrl"
                />
              </div>
            </li>
          </ul>
        </div>
      </div>
    </template>

    <!-- 人物の詳細 -->
    <template v-else-if="isPerson && personData">
      <div class="space-y-1 text-sm text-gray-600">
        <p>
          <span class="font-medium">生年:</span>
          {{ formatYear(personData.person.birthYear) }}
        </p>
        <p>
          <span class="font-medium">没年:</span>
          {{ formatYear(personData.person.deathYear) }}
        </p>
        <p v-if="personData.person.description">
          {{ personData.person.description }}
        </p>
        <p>
          <span class="font-medium">関連イベント:</span>
          {{ personData.relatedEventIds.length }}件
        </p>
      </div>
    </template>

    <!-- 作品の詳細 -->
    <template v-else-if="isMedia && mediaData">
      <div class="space-y-1 text-sm text-gray-600">
        <p>
          <span class="font-medium">タイプ:</span>
          <span
            class="ml-1 rounded px-1.5 py-0.5 text-xs"
            :class="{
              'bg-pink-100 text-pink-700': mediaData.media.type === 'manga',
              'bg-purple-100 text-purple-700': mediaData.media.type === 'novel',
            }"
          >
            {{ mediaData.media.type }}
          </span>
        </p>
        <p v-if="mediaData.media.coverageStartYear && mediaData.media.coverageEndYear">
          <span class="font-medium">カバー範囲:</span>
          {{ formatYear(mediaData.media.coverageStartYear) }} 〜
          {{ formatYear(mediaData.media.coverageEndYear) }}
        </p>
        <p v-if="mediaData.media.remark">
          {{ mediaData.media.remark }}
        </p>

        <!-- Kindleリンク -->
        <a
          v-if="kindleUrl"
          :href="kindleUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-2 inline-flex items-center gap-1 rounded bg-amber-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600"
        >
          <BookOpen class="h-4 w-4" />
          Kindleで見る
          <ExternalLink class="h-3 w-3" />
        </a>
      </div>
    </template>

    <!-- イベントの詳細 -->
    <template v-else-if="isEvent && eventData">
      <div class="space-y-2 text-sm text-gray-600">
        <p>
          <span class="font-medium">年:</span>
          {{ eventData.yearDisplay }}
        </p>
        <p>
          <span class="font-medium">時代:</span>
          {{ eventData.era }}
        </p>
        <p v-if="eventData.description">
          {{ eventData.description }}
        </p>

        <!-- 関連メディア -->
        <div v-if="relatedMedia.length > 0" class="pt-2 border-t border-gray-100">
          <p class="font-medium text-gray-900 mb-1.5">関連作品:</p>
          <div class="flex flex-wrap gap-1.5">
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
      </div>
    </template>

    <!-- Podcastの詳細 -->
    <template v-else-if="isPodcast && podcastData">
      <div class="space-y-1 text-sm text-gray-600">
        <p class="text-xs text-gray-500">
          #{{ podcastData.series.seriesNumber }} {{ podcastData.series.subtitle }}
        </p>
        <p>
          <span class="font-medium">カバー範囲:</span>
          {{ formatYear(podcastData.series.coverageStartYear) }} 〜
          {{ formatYear(podcastData.series.coverageEndYear) }}
        </p>
        <p>
          <span class="font-medium">時代:</span>
          {{ podcastData.series.era }}
        </p>
        <p>
          <span class="font-medium">エピソード数:</span>
          {{ podcastData.series.episodeCount }}話
        </p>
        <p v-if="podcastData.series.type === 'short'">
          <span class="rounded bg-yellow-100 px-1.5 py-0.5 text-xs text-yellow-700">
            ショート版
          </span>
        </p>

        <!-- Spotifyリンク -->
        <a
          :href="podcastData.series.spotifyUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-2 inline-flex items-center gap-1 rounded bg-green-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-600"
        >
          🎧 Spotifyで聴く
          <ExternalLink class="h-3 w-3" />
        </a>
      </div>
    </template>

    <!-- 故事成語の詳細 -->
    <template v-else-if="isIdiom && idiomData">
      <div class="space-y-2 text-sm text-gray-600">
        <p class="text-xs text-gray-500">
          {{ idiomData.idiom.reading }}
        </p>
        <p>
          <span class="font-medium">意味:</span>
          {{ idiomData.idiom.meaning }}
        </p>
        <p>
          <span class="font-medium">由来:</span>
          {{ idiomData.idiom.origin }}
        </p>
        <p>
          <span class="font-medium">年代:</span>
          {{ idiomData.idiom.yearDisplay }}（{{ idiomData.idiom.era }}）
        </p>

        <!-- 関連メディア -->
        <div v-if="idiomRelatedMedia.length > 0" class="pt-2 border-t border-gray-100">
          <p class="font-medium text-gray-900 mb-1.5">関連作品:</p>
          <div class="flex flex-wrap gap-1.5">
            <MediaBadge
              v-for="media in idiomRelatedMedia"
              :key="media.id"
              :type="media.type"
              :title="media.title"
              :remark="media.remark"
              :kindle-url="media.kindleUrl"
            />
          </div>
        </div>

        <!-- Wikipediaリンク -->
        <a
          v-if="idiomData.idiom.links.length > 0"
          :href="idiomData.idiom.links[0]"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-2 inline-flex items-center gap-1 rounded bg-purple-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-600"
        >
          📖 詳しく見る
          <ExternalLink class="h-3 w-3" />
        </a>
      </div>
    </template>
  </div>
</template>
