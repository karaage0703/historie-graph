<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTimeline } from '@/composables/useTimeline'
import { useTimelineZoom } from '@/composables/useTimelineZoom'
import type { ExtendedHistoryEvent } from '@/types/timeline'
import EraLane from './EraLane.vue'
import PersonLane from './PersonLane.vue'
import MediaLane from './MediaLane.vue'
import EventMarker from './EventMarker.vue'
import TimelinePopover from './TimelinePopover.vue'

const props = defineProps<{
  events: ExtendedHistoryEvent[]
}>()

const emit = defineEmits<{
  (e: 'select', item: { type: string; data: unknown }): void
}>()

// DOM参照
const containerRef = ref<HTMLElement | null>(null)
const containerWidth = ref(1000)

// タイムラインデータ
const eventsRef = computed(() => props.events)
const {
  timeRange,
  regionEraGroups,
  personLanes,
  mediaLanes,
  eventMarkers,
  yearToPosition,
} = useTimeline(eventsRef)

// ズーム/パン
const { scale, offsetX, transform, visibleYearRange, zoomIn, zoomOut, panTo, reset } =
  useTimelineZoom(timeRange.value, containerWidth.value)

// ドラッグ状態
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartOffset = ref(0)

// ポップオーバー
const popoverData = ref<{
  show: boolean
  x: number
  y: number
  type: 'era' | 'person' | 'media' | 'event'
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

const svgHeight = computed(() => {
  const personHeight = personLanes.value.length * LANE_HEIGHT
  const mediaHeight = mediaLanes.value.length * LANE_HEIGHT
  const markerHeight = LANE_HEIGHT
  return markerStartY.value + markerHeight + LANE_GAP + personHeight + LANE_GAP + mediaHeight + LANE_GAP + 60
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

// ドラッグでパン
const handleMouseDown = (e: MouseEvent) => {
  isDragging.value = true
  dragStartX.value = e.clientX
  dragStartOffset.value = offsetX.value
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return
  const deltaX = e.clientX - dragStartX.value
  panTo(dragStartOffset.value + deltaX)
}

const handleMouseUp = () => {
  isDragging.value = false
}

// クリックハンドラ
const handleItemClick = (
  e: MouseEvent,
  type: 'era' | 'person' | 'media' | 'event',
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
  window.addEventListener('resize', updateContainerWidth)
  window.addEventListener('mouseup', handleMouseUp)
  window.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateContainerWidth)
  window.removeEventListener('mouseup', handleMouseUp)
  window.removeEventListener('mousemove', handleMouseMove)
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

const getMarkerLaneY = () => {
  return markerStartY.value
}

const getPersonLaneY = (index: number) => {
  return markerStartY.value + LANE_HEIGHT + LANE_GAP + index * LANE_HEIGHT
}

const getMediaLaneY = (index: number) => {
  const personCount = personLanes.value.length
  return markerStartY.value + LANE_HEIGHT + LANE_GAP + personCount * LANE_HEIGHT + LANE_GAP + index * LANE_HEIGHT
}
</script>

<template>
  <div class="relative flex flex-col">
    <!-- ツールバー -->
    <div class="mb-2 flex items-center gap-2 text-sm">
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

    <!-- タイムラインキャンバス -->
    <div
      ref="containerRef"
      class="overflow-hidden rounded-lg border border-gray-200 bg-white"
      :class="{ 'cursor-grabbing': isDragging, 'cursor-grab': !isDragging }"
      @wheel="handleWheel"
      @mousedown="handleMouseDown"
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
              >
                {{ label.label }}
              </text>
            </template>
          </g>

          <!-- 国別時代レーン -->
          <g v-for="group in regionEraGroups" :key="group.region">
            <!-- 国名ラベル -->
            <text
              :x="10"
              :y="(regionHeights[group.region]?.startY ?? 24) + 16"
              class="fill-gray-600 text-xs font-bold"
            >
              {{ group.regionLabel }}
            </text>
            <!-- 時代レーン -->
            <EraLane
              v-for="lane in group.lanes"
              :key="`${lane.region}-${lane.era}`"
              :lane="lane"
              :y="getEraLaneY(lane.region, lane.laneIndex)"
              :height="LANE_HEIGHT - 4"
              :year-to-position="yearToPosition"
              @click="(e) => handleItemClick(e, 'era', lane)"
            />
          </g>

          <!-- イベントマーカー（時代の次に表示） -->
          <g>
            <text
              :x="10"
              :y="getMarkerLaneY() - 8"
              class="fill-gray-600 text-xs font-bold"
            >
              イベント
            </text>
            <EventMarker
              v-for="marker in eventMarkers"
              :key="marker.event.id"
              :marker="marker"
              :y="getMarkerLaneY()"
              @click="(e) => handleItemClick(e, 'event', marker.event)"
            />
          </g>

          <!-- 人物レーン -->
          <g v-if="personLanes.length > 0">
            <text
              :x="10"
              :y="getPersonLaneY(0) - 8"
              class="fill-gray-600 text-xs font-bold"
            >
              人物
            </text>
            <PersonLane
              v-for="(lane, index) in personLanes"
              :key="lane.person.name"
              :lane="lane"
              :y="getPersonLaneY(index)"
              :height="LANE_HEIGHT - 4"
              :year-to-position="yearToPosition"
              @click="(e) => handleItemClick(e, 'person', lane)"
            />
          </g>

          <!-- 作品レーン -->
          <g v-if="mediaLanes.length > 0">
            <text
              :x="10"
              :y="getMediaLaneY(0) - 8"
              class="fill-gray-600 text-xs font-bold"
            >
              関連作品
            </text>
            <MediaLane
              v-for="(lane, index) in mediaLanes"
              :key="`${lane.parentEventId}-${lane.media.title}`"
              :lane="lane"
              :y="getMediaLaneY(index)"
              :height="LANE_HEIGHT - 4"
              :year-to-position="yearToPosition"
              @click="(e) => handleItemClick(e, 'media', lane)"
            />
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
      @close="closePopover"
    />
  </div>
</template>
