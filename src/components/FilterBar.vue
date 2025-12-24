<script setup lang="ts">
import { Filter, X } from 'lucide-vue-next'
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
  <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
    <div class="mb-3 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Filter class="h-5 w-5 text-gray-600" />
        <h2 class="font-medium text-gray-900">フィルター</h2>
      </div>
      <button
        v-if="hasActiveFilters"
        type="button"
        class="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        @click="clearFilters"
      >
        <X class="h-4 w-4" />
        クリア
      </button>
    </div>

    <div class="space-y-4">
      <div>
        <h3 class="mb-2 text-sm font-medium text-gray-700">地域</h3>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="region in availableRegions(events)"
            :key="region"
            type="button"
            class="rounded-full px-3 py-1 text-sm transition-colors"
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
            class="rounded-full px-3 py-1 text-sm transition-colors"
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
</template>
