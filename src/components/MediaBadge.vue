<script setup lang="ts">
import { computed } from 'vue'
import { Book, BookOpen, ExternalLink } from 'lucide-vue-next'
import type { MediaType } from '@/types'
import { useAffiliateLink } from '@/composables/useAffiliateLink'

const props = defineProps<{
  type: MediaType
  title: string
  remark?: string
  kindleUrl?: string
}>()

const { generateAffiliateUrl } = useAffiliateLink()

const affiliateUrl = computed(() => {
  if (!props.kindleUrl) return null
  return generateAffiliateUrl(props.kindleUrl)
})

const iconMap = {
  manga: Book,
  novel: BookOpen,
}

const labelMap: Record<MediaType, string> = {
  manga: '漫画',
  novel: '小説',
}

const colorMap: Record<MediaType, string> = {
  manga: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
  novel: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
}
</script>

<template>
  <a
    v-if="affiliateUrl"
    :href="affiliateUrl"
    target="_blank"
    rel="noopener noreferrer"
    class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer"
    :class="colorMap[type]"
    :title="remark ? `${remark} - Kindleで見る` : 'Kindleで見る'"
  >
    <component :is="iconMap[type]" class="h-3.5 w-3.5" />
    <span>{{ title }}</span>
    <span class="text-xs opacity-70">({{ labelMap[type] }})</span>
    <ExternalLink class="h-3 w-3 opacity-60" />
  </a>
  <div
    v-else
    class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
    :class="colorMap[type]"
    :title="remark"
  >
    <component :is="iconMap[type]" class="h-3.5 w-3.5" />
    <span>{{ title }}</span>
    <span class="text-xs opacity-70">({{ labelMap[type] }})</span>
  </div>
</template>
