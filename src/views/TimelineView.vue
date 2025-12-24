<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { Clock } from 'lucide-vue-next'
import { useEvents } from '@/composables/useEvents'
import { useFilters } from '@/composables/useFilters'
import EventCard from '@/components/EventCard.vue'
import FilterBar from '@/components/FilterBar.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'

const { sortedEvents, isLoading, fetchEvents } = useEvents()
const { filteredEvents } = useFilters()

const displayEvents = computed(() => filteredEvents(sortedEvents.value))

onMounted(() => {
  fetchEvents()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="mx-auto max-w-4xl px-4">
      <div class="mb-8 flex items-center gap-3">
        <Clock class="h-8 w-8 text-gray-700" />
        <h1 class="text-2xl font-bold text-gray-900">タイムライン</h1>
      </div>

      <ErrorMessage :on-retry="fetchEvents" />

      <LoadingSpinner v-if="isLoading" message="データを読み込み中..." />

      <template v-else>
        <FilterBar :events="sortedEvents" class="mb-6" />

        <div v-if="displayEvents.length === 0" class="rounded-lg bg-white p-8 text-center shadow">
          <p class="text-gray-600">表示するイベントがありません</p>
        </div>

        <div v-else class="space-y-4">
          <EventCard v-for="event in displayEvents" :key="event.id" :event="event" />
        </div>
      </template>
    </div>
  </div>
</template>
