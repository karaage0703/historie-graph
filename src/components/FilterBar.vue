<script setup lang="ts">
import { ref } from 'vue'
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-vue-next'
import { useFilters } from '@/composables/useFilters'
import type { HistoryEvent } from '@/types'

const props = defineProps<{
  events: HistoryEvent[]
}>()

const {
  selectedRegions,
  selectedEras,
  hasActiveFilters,
  setRegionFilter,
  setEraFilter,
  clearFilters,
  availableRegions,
  availableEras,
} = useFilters()

const isExpanded = ref(false)

const regionLabels: Record<string, string> = {
  china: '中国',
  japan: '日本',
  europe: 'ヨーロッパ',
  middle_east: '中東',
  other: 'その他',
}

function toggleRegion(region: string) {
  if (selectedRegions.value.includes(region)) {
    setRegionFilter(selectedRegions.value.filter((r) => r !== region))
  } else {
    setRegionFilter([...selectedRegions.value, region])
  }
}

function toggleEra(era: string) {
  if (selectedEras.value.includes(era)) {
    setEraFilter(selectedEras.value.filter((e) => e !== era))
  } else {
    setEraFilter([...selectedEras.value, era])
  }
}
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white shadow-sm">
    <!-- Header - always visible -->
    <div class="flex items-center justify-between p-3 sm:p-4">
      <button
        type="button"
        class="flex flex-1 items-center gap-2 sm:cursor-default"
        @click="isExpanded = !isExpanded"
      >
        <Filter class="h-5 w-5 text-gray-600" />
        <h2 class="font-medium text-gray-900">フィルター</h2>
        <span
          v-if="hasActiveFilters"
          class="rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white"
        >
          適用中
        </span>
        <ChevronUp v-if="isExpanded" class="ml-auto h-5 w-5 text-gray-400 sm:hidden" />
        <ChevronDown v-else class="ml-auto h-5 w-5 text-gray-400 sm:hidden" />
      </button>
      <button
        v-if="hasActiveFilters"
        type="button"
        class="ml-2 flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        @click="clearFilters"
      >
        <X class="h-4 w-4" />
        <span class="hidden sm:inline">クリア</span>
      </button>
    </div>

    <!-- Filter content - collapsible on mobile -->
    <div
      class="overflow-hidden transition-all duration-200"
      :class="isExpanded ? 'max-h-96' : 'max-h-0 sm:max-h-none'"
    >
      <div class="space-y-4 border-t border-gray-100 p-3 sm:border-t-0 sm:p-4 sm:pt-0">
        <div>
          <h3 class="mb-2 text-sm font-medium text-gray-700">地域</h3>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="region in availableRegions(events)"
              :key="region"
              type="button"
              class="rounded-full px-3 py-1.5 text-sm transition-colors sm:py-1"
              :class="
                selectedRegions.includes(region)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              "
              @click="toggleRegion(region)"
            >
              {{ regionLabels[region] || region }}
            </button>
          </div>
        </div>

        <div>
          <h3 class="mb-2 text-sm font-medium text-gray-700">時代</h3>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="era in availableEras(events)"
              :key="era"
              type="button"
              class="rounded-full px-3 py-1.5 text-sm transition-colors sm:py-1"
              :class="
                selectedEras.includes(era)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              "
              @click="toggleEra(era)"
            >
              {{ era }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
