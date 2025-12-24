<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { X, BookOpen, ExternalLink } from 'lucide-vue-next'
import { useAffiliateLink } from '@/composables/useAffiliateLink'
import type {
  EraLaneData,
  PersonLaneData,
  MediaLaneData,
  ExtendedHistoryEvent,
} from '@/types/timeline'

const props = defineProps<{
  type: 'era' | 'person' | 'media' | 'event'
  data: unknown
  x: number
  y: number
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

const eraData = computed(() => (isEra.value ? (props.data as EraLaneData) : null))
const personData = computed(() => (isPerson.value ? (props.data as PersonLaneData) : null))
const mediaData = computed(() => (isMedia.value ? (props.data as MediaLaneData) : null))
const eventData = computed(() => (isEvent.value ? (props.data as ExtendedHistoryEvent) : null))

// Kindleリンク
const kindleUrl = computed(() => {
  if (!isMedia.value || !mediaData.value?.media.kindleUrl) return null
  return generateAffiliateUrl(mediaData.value.media.kindleUrl)
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
      <div class="space-y-1 text-sm text-gray-600">
        <p>
          <span class="font-medium">期間:</span>
          {{ formatYear(eraData.startYear) }} 〜 {{ formatYear(eraData.endYear) }}
        </p>
        <p>
          <span class="font-medium">継続年数:</span>
          {{ eraData.duration }}年
        </p>
        <p>
          <span class="font-medium">イベント数:</span>
          {{ eraData.events.length }}件
        </p>
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
              'bg-amber-100 text-amber-700': mediaData.media.type === 'movie',
              'bg-emerald-100 text-emerald-700': mediaData.media.type === 'anime',
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
      <div class="space-y-1 text-sm text-gray-600">
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
      </div>
    </template>
  </div>
</template>
