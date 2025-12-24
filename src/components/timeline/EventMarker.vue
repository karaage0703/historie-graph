<script setup lang="ts">
import type { EventMarkerData } from '@/types/timeline'

defineProps<{
  marker: EventMarkerData
  y: number
}>()

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
      :points="`${marker.position},${y} ${marker.position + 8},${y + 8} ${marker.position},${y + 16} ${marker.position - 8},${y + 8}`"
      fill="#ef4444"
      stroke="#b91c1c"
      stroke-width="1"
      class="hover:fill-red-400"
    />
    <!-- ラベル -->
    <text
      :x="marker.position"
      :y="y + 28"
      text-anchor="middle"
      class="pointer-events-none fill-gray-700 text-[10px]"
    >
      {{ marker.event.title.length > 8 ? marker.event.title.slice(0, 8) + '...' : marker.event.title }}
    </text>
  </g>
</template>
