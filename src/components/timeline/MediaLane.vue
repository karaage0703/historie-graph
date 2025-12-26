<script setup lang="ts">
import { computed } from 'vue'
import type { MediaLaneData } from '@/types/timeline'

const props = defineProps<{
  lane: MediaLaneData
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

// メディアタイプごとの色
const mediaColors: Record<string, { fill: string; stroke: string; text: string }> = {
  manga: { fill: '#fce7f3', stroke: '#ec4899', text: '#be185d' },
  novel: { fill: '#ddd6fe', stroke: '#8b5cf6', text: '#6d28d9' },
  movie: { fill: '#fef3c7', stroke: '#f59e0b', text: '#b45309' },
  anime: { fill: '#d1fae5', stroke: '#10b981', text: '#047857' },
}

const getColors = (type: string) => {
  return mediaColors[type] || { fill: '#e5e7eb', stroke: '#9ca3af', text: '#374151' }
}

const colors = getColors(props.lane.media.type)

// カバー範囲がある場合はそれを使用、なければ親イベントの年を基準にする
const hasRange =
  props.lane.media.coverageStartYear !== undefined &&
  props.lane.media.coverageEndYear !== undefined

const x = hasRange
  ? props.yearToPosition(props.lane.media.coverageStartYear!)
  : 0

const width = hasRange
  ? props.yearToPosition(props.lane.media.coverageEndYear!) - x
  : 60 // デフォルト幅
</script>

<template>
  <g
    class="cursor-pointer"
    @click="(e) => emit('click', e)"
  >
    <rect
      :x="x"
      :y="y"
      :width="Math.max(width, 40)"
      :height="height"
      :fill="colors.fill"
      :stroke="colors.stroke"
      stroke-width="1"
      rx="4"
      class="hover:stroke-2"
    />
    <text
      :x="x + Math.max(width, 40) / 2"
      :y="y + height / 2 + 4"
      text-anchor="middle"
      class="pointer-events-none text-xs font-medium"
      :fill="colors.text"
      :style="{ transform: textTransform, transformOrigin: `${x + Math.max(width, 40) / 2}px ${y + height / 2 + 4}px` }"
    >
      {{ lane.media.title.length > 10 ? lane.media.title.slice(0, 10) + '...' : lane.media.title }}
    </text>
  </g>
</template>
