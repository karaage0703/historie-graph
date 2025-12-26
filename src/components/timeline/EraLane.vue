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
  夏: '#fef9c3',
  '殷（商）': '#fde047',
  西周: '#fcd34d',
  春秋時代: '#fef3c7',
  戦国時代: '#fde68a',
  秦: '#fca5a5',
  楚漢戦争: '#fed7aa',
  前漢: '#bfdbfe',
  新: '#ddd6fe',
  後漢: '#bbf7d0',
  三国時代: '#6ee7b7',
  西晋: '#a5f3fc',
  東晋: '#67e8f9',
  五胡十六国: '#fda4af',
  南北朝時代: '#f9a8d4',
  隋: '#c4b5fd',
  唐: '#a78bfa',
  五代十国: '#f0abfc',
  北宋: '#93c5fd',
  南宋: '#60a5fa',
  遼: '#fdba74',
  金: '#fb923c',
  元: '#86efac',
  明: '#f87171',
  清: '#fbbf24',
  中華民国: '#fca5a5',
  中華人民共和国: '#ef4444',
  // ヨーロッパ史
  古代ギリシャ: '#93c5fd',
  ヘレニズム時代: '#60a5fa',
  共和政ローマ: '#c4b5fd',
  帝政ローマ: '#a78bfa',
  中世ヨーロッパ: '#fda4af',
  ルネサンス: '#fcd34d',
  フランス革命: '#f87171',
  // 中東史
  アケメネス朝ペルシャ: '#fef3c7',
  ササン朝ペルシャ: '#fde68a',
  イスラーム初期: '#6ee7b7',
  ウマイヤ朝: '#86efac',
  アッバース朝: '#34d399',
  オスマン帝国: '#f87171',
  // 日本史
  縄文時代: '#d9f99d',
  弥生時代: '#bef264',
  古墳時代: '#a3e635',
  飛鳥時代: '#fef3c7',
  奈良時代: '#fde68a',
  平安時代: '#fca5a5',
  鎌倉時代: '#93c5fd',
  建武の新政: '#c4b5fd',
  室町時代: '#a78bfa',
  戦国時代_日本: '#f87171',
  安土桃山時代: '#fb923c',
  江戸時代: '#6ee7b7',
  明治時代: '#67e8f9',
  大正時代: '#a5f3fc',
  昭和時代: '#93c5fd',
  平成時代: '#c4b5fd',
  令和時代: '#f9a8d4',
  // デフォルト
  default: '#e5e7eb',
}

const getColor = (era: string): string => {
  return eraColors[era] || eraColors['default'] || '#e5e7eb'
}

const x = computed(() => props.yearToPosition(props.lane.startYear))
const width = computed(() => props.yearToPosition(props.lane.endYear) - x.value)
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
