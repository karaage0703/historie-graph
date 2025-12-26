<script setup lang="ts">
import { computed } from 'vue'
import type { PodcastLaneData } from '@/types/timeline'

const props = defineProps<{
  lane: PodcastLaneData
  y: number
  height: number
  yearToPosition: (year: number) => number
  scale: number
}>()

// テキストの逆スケール変換
const textTransform = computed(() => `scaleX(${1 / props.scale})`)

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

const isShort = computed(() => props.lane.series.type === 'short')

const x = computed(() => props.yearToPosition(props.lane.series.coverageStartYear))
const endX = computed(() => props.yearToPosition(props.lane.series.coverageEndYear))
const width = computed(() => Math.max(endX.value - x.value, 60))

// 表示用タイトル（シリーズ番号 + タイトル）
const displayTitle = computed(() => `#${props.lane.series.seriesNumber} ${props.lane.series.title}`)
const truncatedTitle = computed(() => displayTitle.value.length > 15 ? displayTitle.value.slice(0, 15) + '...' : displayTitle.value)
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
      :style="{ transform: textTransform, transformOrigin: `${x + width / 2}px ${y + height / 2 + 4}px` }"
    >
      {{ truncatedTitle }}
    </text>
  </g>
</template>
