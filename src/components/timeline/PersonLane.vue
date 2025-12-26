<script setup lang="ts">
import { computed } from 'vue'
import type { PersonLaneData } from '@/types/timeline'

const props = defineProps<{
  lane: PersonLaneData
  y: number
  height: number
  yearToPosition: (year: number) => number
  scale: number
}>()

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

// テキストの逆スケール変換
const textTransform = computed(() => `scaleX(${1 / props.scale})`)

const x = computed(() => props.yearToPosition(props.lane.person.birthYear))
const width = computed(() => props.yearToPosition(props.lane.person.deathYear) - x.value)
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
      fill="#dbeafe"
      stroke="#3b82f6"
      stroke-width="1"
      rx="4"
      class="hover:stroke-blue-600 hover:stroke-2"
    />
    <text
      :x="x + Math.max(width, 20) / 2"
      :y="y + height / 2 + 4"
      text-anchor="middle"
      class="pointer-events-none fill-blue-800 text-xs font-medium"
      :style="{ transform: textTransform, transformOrigin: `${x + Math.max(width, 20) / 2}px ${y + height / 2 + 4}px` }"
    >
      {{ lane.person.name }}
    </text>
  </g>
</template>
