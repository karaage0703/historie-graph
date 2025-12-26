<script setup lang="ts">
import { Book, BookOpen } from 'lucide-vue-next'
import type { MediaType } from '@/types'

defineProps<{
  type: MediaType
  title: string
  remark?: string
}>()

const iconMap = {
  manga: Book,
  novel: BookOpen,
}

const labelMap: Record<MediaType, string> = {
  manga: '漫画',
  novel: '小説',
}

const colorMap: Record<MediaType, string> = {
  manga: 'bg-orange-100 text-orange-800',
  novel: 'bg-purple-100 text-purple-800',
}
</script>

<template>
  <div
    class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
    :class="colorMap[type]"
    :title="remark"
  >
    <component :is="iconMap[type]" class="h-3.5 w-3.5" />
    <span>{{ title }}</span>
    <span class="text-xs opacity-70">({{ labelMap[type] }})</span>
  </div>
</template>
