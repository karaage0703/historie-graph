<script setup lang="ts">
import type { PodcastLaneData } from '@/types/timeline'

const props = defineProps<{
  lane: PodcastLaneData
  y: number
  height: number
  yearToPosition: (year: number) => number
}>()

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

// COTEN RADIO用の色（オレンジ系 - Podcastっぽい色）
const colors = {
  fill: '#ffedd5',
  stroke: '#f97316',
  text: '#c2410c',
  shortFill: '#fef3c7',
  shortStroke: '#eab308',
  shortText: '#a16207',
}

const isShort = props.lane.series.type === 'short'

const x = props.yearToPosition(props.lane.series.coverageStartYear)
const endX = props.yearToPosition(props.lane.series.coverageEndYear)
const width = Math.max(endX - x, 60)

// 表示用タイトル（シリーズ番号 + タイトル）
const displayTitle = `#${props.lane.series.seriesNumber} ${props.lane.series.title}`
const truncatedTitle = displayTitle.length > 15 ? displayTitle.slice(0, 15) + '...' : displayTitle
</script>

<template>
  <g
    class="cursor-pointer"
    @click="(e) => emit('click', e)"
  >
    <rect
      :x="x"
      :y="y"
      :width="width"
      :height="height"
      :fill="isShort ? colors.shortFill : colors.fill"
      :stroke="isShort ? colors.shortStroke : colors.stroke"
      stroke-width="1"
      rx="4"
      class="hover:stroke-2"
    />
    <text
      :x="x + width / 2"
      :y="y + height / 2 + 4"
      text-anchor="middle"
      class="pointer-events-none text-xs font-medium"
      :fill="isShort ? colors.shortText : colors.text"
    >
      {{ truncatedTitle }}
    </text>
  </g>
</template>
