<script setup lang="ts">
import { computed } from 'vue'
import type { EventMarkerData } from '@/types/timeline'

const props = defineProps<{
  marker: EventMarkerData
  y: number
  scale: number
}>()

// テキストの逆スケール変換
const textTransform = computed(() => `scaleX(${1 / props.scale})`)

// 菱形の横幅を逆スケールで調整（scaleX後も一定のサイズになるように）
const diamondOffset = computed(() => 8 / props.scale)

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()
</script>

<template>
  <g
    class="cursor-pointer"
    @click="(e) => emit('click', e)"
  >
    <!-- マーカー（菱形） -->
    <polygon
      :points="`${props.marker.position},${props.y} ${props.marker.position + diamondOffset},${props.y + 8} ${props.marker.position},${props.y + 16} ${props.marker.position - diamondOffset},${props.y + 8}`"
      fill="#ef4444"
      stroke="#b91c1c"
      stroke-width="1"
      class="hover:fill-red-400"
    />
    <!-- ラベル -->
    <text
      :x="props.marker.position"
      :y="props.y + 28"
      text-anchor="middle"
      class="pointer-events-none fill-gray-700 text-[10px]"
      :style="{ transform: textTransform, transformOrigin: `${props.marker.position}px ${props.y + 28}px` }"
    >
      {{ props.marker.event.title.length > 8 ? props.marker.event.title.slice(0, 8) + '...' : props.marker.event.title }}
    </text>
  </g>
</template>
