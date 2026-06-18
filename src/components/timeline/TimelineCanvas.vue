<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTimeline } from '@/composables/useTimeline'
import { useTimelineZoom } from '@/composables/useTimelineZoom'
import { useCotenRadio } from '@/composables/useCotenRadio'
import { useIdioms } from '@/composables/useIdioms'
import { useFilters } from '@/composables/useFilters'
import type { MediaItem, Idiom } from '@/types'
import type { ExtendedHistoryEvent } from '@/types/timeline'
import EraLane from './EraLane.vue'
import PersonLane from './PersonLane.vue'
import MediaLane from './MediaLane.vue'
import PodcastLane from './PodcastLane.vue'
import EventMarker from './EventMarker.vue'
import IdiomMarker from './IdiomMarker.vue'
import TimelinePopover from './TimelinePopover.vue'

const props = defineProps<{
  events: ExtendedHistoryEvent[]
  allEvents: ExtendedHistoryEvent[]
  media: MediaItem[]
  allMedia: MediaItem[]
  idioms: Idiom[]
}>()

// 共通フィルター
const {
  selectedRegions,
  showEvents,
  showCotenRadio,
  showMedia,
  showIdioms,
  effectiveYearRange,
} = useFilters()

// 年代範囲をRefとして渡すための変換
const yearRangeRef = computed(() => effectiveYearRange.value)

// COTEN RADIO（共通フィルターを渡す）
const {
  loadCotenRadio,
  podcastLanes,
  maxLaneIndex: podcastMaxLaneIndex,
} = useCotenRadio(selectedRegions, yearRangeRef)

// 故事成語
const idiomsRef = computed(() => props.idioms)
const {
  idiomLanes,
  maxLaneIndex: idiomMaxLaneIndex,
} = useIdioms(idiomsRef, selectedRegions, yearRangeRef)

const emit = defineEmits<{
  (e: 'select', item: { type: string; data: unknown }): void
}>()

// DOM参照
const containerRef = ref<HTMLElement | null>(null)
const containerWidth = ref(1000)

// タイムラインデータ
const eventsRef = computed(() => props.events)
const allEventsRef = computed(() => props.allEvents)
const mediaRef = computed(() => props.media)
const allMediaRef = computed(() => props.allMedia)
const {
  timeRange,
  regionEraGroups,
  personLanes,
  mediaLanes,
  eventMarkers,
  eventMaxLaneIndex,
  yearToPosition,
} = useTimeline(eventsRef, allEventsRef, mediaRef, allMediaRef, yearRangeRef)

// ズーム/パン（Refを渡す）
const { scale, offsetX, transform, visibleYearRange, zoomIn, zoomOut, panTo, reset } =
  useTimelineZoom(timeRange, containerWidth)

// ドラッグ状態
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartOffset = ref(0)

// ポップオーバー
const popoverData = ref<{
  show: boolean
  x: number
  y: number
  type: 'era' | 'person' | 'media' | 'event' | 'podcast' | 'idiom'
  data: unknown
}>({
  show: false,
  x: 0,
  y: 0,
  type: 'event',
  data: null,
})

// SVGの高さ計算
const LANE_HEIGHT = 40
const LANE_GAP = 8
const REGION_HEADER_HEIGHT = 24

// 国ごとの時代レーン高さを計算
const regionHeights = computed(() => {
  const heights: Record<string, { startY: number; height: number; maxLaneIndex: number }> = {}
  let currentY = 40 // 年ラベルの下から開始

  regionEraGroups.value.forEach((group) => {
    const maxLaneIndex = Math.max(...group.lanes.map((l) => l.laneIndex), 0)
    const height = (maxLaneIndex + 1) * LANE_HEIGHT
    heights[group.region] = {
      startY: currentY,
      height,
      maxLaneIndex,
    }
    currentY += REGION_HEADER_HEIGHT + height + LANE_GAP
  })

  return heights
})

// イベントマーカーの開始Y座標
const markerStartY = computed(() => {
  const allHeights = Object.values(regionHeights.value)
  if (allHeights.length === 0) return 40
  const lastRegion = allHeights[allHeights.length - 1]
  if (!lastRegion) return 40
  return lastRegion.startY + REGION_HEADER_HEIGHT + lastRegion.height + LANE_GAP
})

// COTEN RADIOレーンの高さ
const podcastSectionHeight = computed(() => {
  if (!showCotenRadio.value || podcastLanes.value.length === 0) return 0
  return (podcastMaxLaneIndex.value + 1) * LANE_HEIGHT + LANE_GAP
})

// イベントマーカーの高さ（重複を避けるため複数レーン対応）
const eventSectionHeight = computed(() => {
  if (!showEvents.value || eventMarkers.value.length === 0) return 0
  return (eventMaxLaneIndex.value + 1) * LANE_HEIGHT + LANE_GAP
})

// 作品レーンの高さ
const mediaSectionHeight = computed(() => {
  if (!showMedia.value || mediaLanes.value.length === 0) return 0
  return mediaLanes.value.length * LANE_HEIGHT + LANE_GAP
})

// 故事成語レーンの高さ
const idiomSectionHeight = computed(() => {
  if (!showIdioms.value || idiomLanes.value.length === 0) return 0
  return (idiomMaxLaneIndex.value + 1) * LANE_HEIGHT + LANE_GAP
})

const svgHeight = computed(() => {
  const personHeight = personLanes.value.length * LANE_HEIGHT
  return markerStartY.value + eventSectionHeight.value + idiomSectionHeight.value + podcastSectionHeight.value + personHeight + LANE_GAP + mediaSectionHeight.value + 60
})

// タイムラインの幅（将来の仮想化で使用予定）
const _timelineWidth = computed(() => {
  const range = timeRange.value.maxYear - timeRange.value.minYear
  return range * 2 // 1年あたり2ピクセル
})
void _timelineWidth // suppress unused warning

// ホイールでズーム
const handleWheel = (e: WheelEvent) => {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault()
    if (e.deltaY < 0) {
      zoomIn()
    } else {
      zoomOut()
    }
  }
}

const handlePointerDown = (e: PointerEvent) => {
  if (e.pointerType === 'mouse' && e.button !== 0) return
  isDragging.value = true
  dragStartX.value = e.clientX
  dragStartOffset.value = offsetX.value
  if (containerRef.value && e.isPrimary) {
    try {
      containerRef.value.setPointerCapture(e.pointerId)
    } catch {
      // Pointer capture can fail for synthetic events or older WebViews.
    }
  }
}

const handlePointerMove = (e: PointerEvent) => {
  if (!isDragging.value) return
  const deltaX = e.clientX - dragStartX.value
  panTo(dragStartOffset.value + deltaX)
}

const handlePointerUp = (e: PointerEvent) => {
  isDragging.value = false
  if (containerRef.value?.hasPointerCapture(e.pointerId)) {
    containerRef.value.releasePointerCapture(e.pointerId)
  }
}

// クリックハンドラ
const handleItemClick = (
  e: MouseEvent,
  type: 'era' | 'person' | 'media' | 'event' | 'podcast' | 'idiom',
  data: unknown
) => {
  popoverData.value = {
    show: true,
    x: e.clientX,
    y: e.clientY,
    type,
    data,
  }
  emit('select', { type, data })
}

const closePopover = () => {
  popoverData.value.show = false
}

// リサイズ監視
const updateContainerWidth = () => {
  if (containerRef.value) {
    containerWidth.value = containerRef.value.clientWidth
  }
}

onMounted(() => {
  updateContainerWidth()
  loadCotenRadio()
  window.addEventListener('resize', updateContainerWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateContainerWidth)
})

// 年ラベルの生成
const yearLabels = computed(() => {
  const { minYear, maxYear } = timeRange.value
  const labels: { year: number; position: number; label: string }[] = []
  const step = Math.ceil((maxYear - minYear) / 10) // 約10個のラベル

  for (let year = minYear; year <= maxYear; year += step) {
    labels.push({
      year,
      position: yearToPosition(year),
      label: year < 0 ? `前${Math.abs(year)}年` : `${year}年`,
    })
  }

  return labels
})

// レーンのY座標計算
const getEraLaneY = (region: string, laneIndex: number) => {
  const regionData = regionHeights.value[region]
  if (!regionData) return 40
  return regionData.startY + REGION_HEADER_HEIGHT + laneIndex * LANE_HEIGHT
}

const getMarkerLaneY = (laneIndex: number) => {
  return markerStartY.value + laneIndex * LANE_HEIGHT
}

// 故事成語レーンの開始Y座標
const getIdiomSectionY = () => {
  return markerStartY.value + eventSectionHeight.value
}

const getIdiomLaneY = (laneIndex: number) => {
  return getIdiomSectionY() + laneIndex * LANE_HEIGHT
}

// COTEN RADIOレーンの開始Y座標
const getPodcastSectionY = () => {
  return markerStartY.value + eventSectionHeight.value + idiomSectionHeight.value
}

const getPodcastLaneY = (laneIndex: number) => {
  return getPodcastSectionY() + laneIndex * LANE_HEIGHT
}

const getPersonLaneY = (index: number) => {
  return getPodcastSectionY() + podcastSectionHeight.value + index * LANE_HEIGHT
}

const getMediaLaneY = (index: number) => {
  const personCount = personLanes.value.length
  return getPodcastSectionY() + podcastSectionHeight.value + personCount * LANE_HEIGHT + LANE_GAP + index * LANE_HEIGHT
}

// 範囲外に伸びている時代（左側にオーバーフロー）- 表示中のレーン
const overflowEras = computed(() => {
  const { minYear } = timeRange.value
  const overflows: { era: string; region: string; startYear: number; y: number }[] = []

  regionEraGroups.value.forEach((group) => {
    group.lanes.forEach((lane) => {
      if (lane.startYear < minYear) {
        overflows.push({
          era: lane.era,
          region: lane.region,
          startYear: lane.startYear,
          y: getEraLaneY(lane.region, lane.laneIndex),
        })
      }
    })
  })

  return overflows
})

// 範囲外に伸びている作品（左側にオーバーフロー）- 表示中のレーン
const overflowMedia = computed(() => {
  const { minYear } = timeRange.value
  const overflows: { title: string; startYear: number; y: number }[] = []

  mediaLanes.value.forEach((lane, index) => {
    const startYear = lane.media.coverageStartYear
    if (startYear !== undefined && startYear < minYear) {
      overflows.push({
        title: lane.media.title,
        startYear,
        y: getMediaLaneY(index),
      })
    }
  })

  return overflows
})

// 完全に範囲外の時代（表示範囲と重ならない）
const outsideEras = computed(() => {
  const { minYear, maxYear } = timeRange.value
  const regionEraMap = new Map<string, { region: string; era: string; startYear: number; endYear: number }>()

  // 全イベントから時代を抽出
  props.allEvents.forEach((event) => {
    const key = `${event.region}::${event.era}`
    const existing = regionEraMap.get(key)
    if (existing) {
      existing.startYear = Math.min(existing.startYear, event.year)
      existing.endYear = Math.max(existing.endYear, event.year)
    } else {
      regionEraMap.set(key, {
        region: event.region,
        era: event.era,
        startYear: event.year,
        endYear: event.year,
      })
    }
  })

  // 完全に範囲外のものを抽出
  const outside: { region: string; era: string; startYear: number; endYear: number; side: 'left' | 'right' }[] = []
  regionEraMap.forEach((data) => {
    if (data.endYear < minYear) {
      outside.push({ ...data, side: 'left' })
    } else if (data.startYear > maxYear) {
      outside.push({ ...data, side: 'right' })
    }
  })

  return outside.sort((a, b) => a.startYear - b.startYear)
})

// 完全に範囲外の作品
const outsideMedia = computed(() => {
  const { minYear, maxYear } = timeRange.value
  const outside: { title: string; startYear: number; endYear: number; side: 'left' | 'right' }[] = []

  props.allMedia.forEach((media) => {
    const start = media.coverageStartYear
    const end = media.coverageEndYear
    if (start !== undefined && end !== undefined) {
      if (end < minYear) {
        outside.push({ title: media.title, startYear: start, endYear: end, side: 'left' })
      } else if (start > maxYear) {
        outside.push({ title: media.title, startYear: start, endYear: end, side: 'right' })
      }
    }
  })

  return outside.sort((a, b) => a.startYear - b.startYear)
})

// 年を表示用文字列に変換
const formatYear = (year: number): string => {
  return year < 0 ? `前${Math.abs(year)}年` : `${year}年`
}
</script>

<template>
  <div class="relative flex flex-col">
    <!-- ツールバー -->
    <div class="mb-2 flex flex-wrap items-center gap-2 text-sm">
      <button
        class="rounded border border-gray-300 px-2 py-1 hover:bg-gray-50"
        @click="zoomIn"
      >
        拡大
      </button>
      <button
        class="rounded border border-gray-300 px-2 py-1 hover:bg-gray-50"
        @click="zoomOut"
      >
        縮小
      </button>
      <button
        class="rounded border border-gray-300 px-2 py-1 hover:bg-gray-50"
        @click="reset"
      >
        リセット
      </button>
      <span class="ml-4 text-gray-600">
        表示範囲:
        {{ visibleYearRange.start < 0 ? `前${Math.abs(Math.round(visibleYearRange.start))}年` : `${Math.round(visibleYearRange.start)}年` }}
        〜
        {{ visibleYearRange.end < 0 ? `前${Math.abs(Math.round(visibleYearRange.end))}年` : `${Math.round(visibleYearRange.end)}年` }}
      </span>
      <span class="text-gray-400">
        ({{ Math.round(scale * 100) }}%)
      </span>
    </div>

    <!-- 範囲外アイテム表示 -->
    <div v-if="outsideEras.length > 0 || outsideMedia.length > 0" class="mb-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs">
      <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span class="font-medium text-amber-700">表示範囲外:</span>
        <template v-for="item in outsideEras" :key="`outside-era-${item.region}-${item.era}`">
          <span class="text-amber-600">
            {{ item.side === 'left' ? '←' : '→' }} {{ item.era }} ({{ formatYear(item.startYear) }}〜{{ formatYear(item.endYear) }})
          </span>
        </template>
        <template v-for="item in outsideMedia" :key="`outside-media-${item.title}`">
          <span class="text-purple-600">
            {{ item.side === 'left' ? '←' : '→' }} {{ item.title }} ({{ formatYear(item.startYear) }}〜{{ formatYear(item.endYear) }})
          </span>
        </template>
      </div>
    </div>

    <!-- 表示切り替え -->
    <div class="mb-2 flex flex-wrap items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
      <span class="font-medium text-gray-700">表示:</span>
      <label class="flex items-center gap-1.5 text-gray-600">
        <input
          v-model="showEvents"
          type="checkbox"
          class="rounded"
        />
        イベント
      </label>
      <label class="flex items-center gap-1.5 text-gray-600">
        <input
          v-model="showCotenRadio"
          type="checkbox"
          class="rounded"
        />
        COTEN RADIO
      </label>
      <label class="flex items-center gap-1.5 text-gray-600">
        <input
          v-model="showMedia"
          type="checkbox"
          class="rounded"
        />
        関連作品
      </label>
      <label class="flex items-center gap-1.5 text-gray-600">
        <input
          v-model="showIdioms"
          type="checkbox"
          class="rounded"
        />
        故事成語
      </label>
    </div>

    <!-- タイムラインキャンバス -->
    <div
      ref="containerRef"
      class="touch-pan-y overflow-hidden rounded-lg border border-gray-200 bg-white"
      :class="{ 'cursor-grabbing': isDragging, 'cursor-grab': !isDragging }"
      @wheel="handleWheel"
      @pointerdown="handlePointerDown"
      @pointermove="handlePointerMove"
      @pointerup="handlePointerUp"
      @pointercancel="handlePointerUp"
    >
      <svg
        :width="containerWidth"
        :height="svgHeight"
        class="select-none"
      >
        <g :style="{ transform }">
          <!-- 年ラベル -->
          <g class="year-labels">
            <template v-for="label in yearLabels" :key="label.year">
              <line
                :x1="label.position"
                y1="20"
                :x2="label.position"
                :y2="svgHeight - 20"
                stroke="#e5e7eb"
                stroke-width="1"
                stroke-dasharray="4,4"
              />
              <text
                :x="label.position"
                y="16"
                text-anchor="middle"
                class="fill-gray-500 text-xs"
                :style="{ transform: `scaleX(${1 / scale})`, transformOrigin: `${label.position}px 16px` }"
              >
                {{ label.label }}
              </text>
            </template>
          </g>

          <!-- 国別時代レーン -->
          <g v-for="group in regionEraGroups" :key="group.region">
            <!-- 時代レーン -->
            <EraLane
              v-for="lane in group.lanes"
              :key="`${lane.region}-${lane.era}`"
              :lane="lane"
              :y="getEraLaneY(lane.region, lane.laneIndex)"
              :height="LANE_HEIGHT - 4"
              :year-to-position="yearToPosition"
              :scale="scale"
              @click="(e) => handleItemClick(e, 'era', lane)"
            />
          </g>

          <!-- イベントマーカー（時代の次に表示） -->
          <g v-if="showEvents">
            <EventMarker
              v-for="marker in eventMarkers"
              :key="marker.event.id"
              :marker="marker"
              :y="getMarkerLaneY(marker.laneIndex)"
              :scale="scale"
              @click="(e) => handleItemClick(e, 'event', marker.event)"
            />
          </g>

          <!-- 故事成語マーカー -->
          <g v-if="showIdioms && idiomLanes.length > 0">
            <IdiomMarker
              v-for="lane in idiomLanes"
              :key="lane.idiom.id"
              :lane="lane"
              :y="getIdiomLaneY(lane.laneIndex)"
              :scale="scale"
              :year-to-position="yearToPosition"
              @click="(e) => handleItemClick(e, 'idiom', lane)"
            />
          </g>

          <!-- COTEN RADIOレーン -->
          <g v-if="showCotenRadio && podcastLanes.length > 0">
            <PodcastLane
              v-for="lane in podcastLanes"
              :key="lane.series.id"
              :lane="lane"
              :y="getPodcastLaneY(lane.laneIndex)"
              :height="LANE_HEIGHT - 4"
              :year-to-position="yearToPosition"
              :scale="scale"
              @click="(e) => handleItemClick(e, 'podcast', lane)"
            />
          </g>

          <!-- 人物レーン -->
          <g v-if="personLanes.length > 0">
            <PersonLane
              v-for="(lane, index) in personLanes"
              :key="lane.person.name"
              :lane="lane"
              :y="getPersonLaneY(index)"
              :height="LANE_HEIGHT - 4"
              :year-to-position="yearToPosition"
              :scale="scale"
              @click="(e) => handleItemClick(e, 'person', lane)"
            />
          </g>

          <!-- 作品レーン -->
          <g v-if="showMedia && mediaLanes.length > 0">
            <MediaLane
              v-for="(lane, index) in mediaLanes"
              :key="lane.media.id"
              :lane="lane"
              :y="getMediaLaneY(index)"
              :height="LANE_HEIGHT - 4"
              :year-to-position="yearToPosition"
              :scale="scale"
              @click="(e) => handleItemClick(e, 'media', lane)"
            />
          </g>
        </g>

        <!-- セクションラベル（固定位置、transformの外） -->
        <g class="section-labels">
          <!-- 国名ラベル -->
          <g v-for="group in regionEraGroups" :key="`label-${group.region}`">
            <rect x="0" :y="(regionHeights[group.region]?.startY ?? 24)" width="50" height="20" fill="white" />
            <text
              x="8"
              :y="(regionHeights[group.region]?.startY ?? 24) + 16"
              class="fill-gray-600 text-xs font-bold"
            >
              {{ group.regionLabel }}
            </text>
          </g>

          <!-- イベントラベル -->
          <g v-if="showEvents">
            <rect x="0" :y="getMarkerLaneY(0) - 16" width="80" height="20" fill="white" />
            <text x="8" :y="getMarkerLaneY(0) - 2" class="fill-gray-600 text-xs font-bold">
              イベント
            </text>
          </g>

          <!-- 故事成語ラベル -->
          <g v-if="showIdioms && idiomLanes.length > 0">
            <rect x="0" :y="getIdiomSectionY() - 16" width="80" height="20" fill="white" />
            <text x="8" :y="getIdiomSectionY() - 2" class="fill-purple-600 text-xs font-bold">
              故事成語
            </text>
          </g>

          <!-- COTEN RADIOラベル -->
          <g v-if="showCotenRadio && podcastLanes.length > 0">
            <rect x="0" :y="getPodcastSectionY() - 16" width="110" height="20" fill="white" />
            <text x="8" :y="getPodcastSectionY() - 2" class="fill-orange-600 text-xs font-bold">
              🎙️ COTEN RADIO
            </text>
          </g>

          <!-- 人物ラベル -->
          <g v-if="personLanes.length > 0">
            <rect x="0" :y="getPersonLaneY(0) - 16" width="50" height="20" fill="white" />
            <text x="8" :y="getPersonLaneY(0) - 2" class="fill-gray-600 text-xs font-bold">
              人物
            </text>
          </g>

          <!-- 関連作品ラベル -->
          <g v-if="showMedia && mediaLanes.length > 0">
            <rect x="0" :y="getMediaLaneY(0) - 16" width="70" height="20" fill="white" />
            <text x="8" :y="getMediaLaneY(0) - 2" class="fill-gray-600 text-xs font-bold">
              関連作品
            </text>
          </g>

          <!-- 範囲外時代インジケーター -->
          <g v-for="overflow in overflowEras" :key="`overflow-era-${overflow.region}-${overflow.era}`">
            <rect x="50" :y="overflow.y" width="180" height="20" fill="rgba(255,255,255,0.9)" rx="2" />
            <text
              x="54"
              :y="overflow.y + 14"
              class="fill-gray-500 text-xs"
            >
              ← {{ overflow.era }} ({{ formatYear(overflow.startYear) }}〜)
            </text>
          </g>

          <!-- 範囲外作品インジケーター -->
          <g v-if="showMedia" v-for="overflow in overflowMedia" :key="`overflow-media-${overflow.title}`">
            <rect x="70" :y="overflow.y" width="200" height="20" fill="rgba(255,255,255,0.9)" rx="2" />
            <text
              x="74"
              :y="overflow.y + 14"
              class="fill-purple-600 text-xs"
            >
              ← {{ overflow.title }} ({{ formatYear(overflow.startYear) }}〜)
            </text>
          </g>
        </g>
      </svg>
    </div>

    <!-- ポップオーバー -->
    <TimelinePopover
      v-if="popoverData.show"
      :type="popoverData.type"
      :data="popoverData.data"
      :x="popoverData.x"
      :y="popoverData.y"
      :all-media="allMedia"
      @close="closePopover"
    />
  </div>
</template>
