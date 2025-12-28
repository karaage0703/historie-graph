<script setup lang="ts">
import { computed } from 'vue'
import type { IdiomLaneData } from '@/types/timeline'

const props = defineProps<{
  lane: IdiomLaneData
  y: number
  scale: number
  yearToPosition: (year: number) => number
}>()

const textTransform = computed(() => `scaleX(${1 / props.scale})`)

const diamondOffset = computed(() => 8 / props.scale)

const position = computed(() => props.yearToPosition(props.lane.idiom.year))

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const truncatedTitle = computed(() => {
  const title = props.lane.idiom.idiom
  return title.length > 6 ? title.slice(0, 6) + '...' : title
})
</script>

<template>
  <g
    class="cursor-pointer"
    @click="(e) => emit('click', e)"
  >
    <polygon
      :points="`${position},${props.y} ${position + diamondOffset},${props.y + 8} ${position},${props.y + 16} ${position - diamondOffset},${props.y + 8}`"
      fill="#a855f7"
      stroke="#7c3aed"
      stroke-width="1"
      class="hover:fill-purple-400"
    />
    <text
      :x="position"
      :y="props.y + 28"
      text-anchor="middle"
      class="pointer-events-none fill-purple-800 text-[10px] font-medium"
      :style="{ transform: textTransform, transformOrigin: `${position}px ${props.y + 28}px` }"
    >
      {{ truncatedTitle }}
    </text>
  </g>
</template>
