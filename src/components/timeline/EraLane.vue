<script setup lang="ts">
import { computed } from 'vue'
import type { EraLaneData } from '@/types/timeline'

const props = defineProps<{
  lane: EraLaneData
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

// 時代ごとの色
const eraColors: Record<string, string> = {
  // 中国史
  春秋: '#fef3c7',
  戦国: '#fde68a',
  秦: '#fca5a5',
  楚漢戦争: '#fed7aa',
  前漢: '#bfdbfe',
  新: '#ddd6fe',
  後漢: '#bbf7d0',
  後漢末: '#86efac',
  三国: '#6ee7b7',
  // デフォルト
  default: '#e5e7eb',
}

const getColor = (era: string): string => {
  return eraColors[era] || eraColors['default'] || '#e5e7eb'
}

const x = props.yearToPosition(props.lane.startYear)
const width = props.yearToPosition(props.lane.endYear) - x
</script>

<template>
  <g
    class="cursor-pointer"
    @click="(e) => emit('click', e)"
  >
    <rect
      :x="x"
      :y="y"
      :width="Math.max(width, 20)"
      :height="height"
      :fill="getColor(lane.era)"
      stroke="#9ca3af"
      stroke-width="1"
      rx="4"
      class="hover:stroke-blue-500 hover:stroke-2"
    />
    <text
      :x="x + Math.max(width, 20) / 2"
      :y="y + height / 2 + 4"
      text-anchor="middle"
      class="pointer-events-none fill-gray-700 text-xs font-medium"
      :style="{ transform: textTransform, transformOrigin: `${x + Math.max(width, 20) / 2}px ${y + height / 2 + 4}px` }"
    >
      {{ lane.era }}
    </text>
  </g>
</template>
