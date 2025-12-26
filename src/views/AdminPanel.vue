<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Pencil, Plus, Edit2, Trash2, AlertCircle } from 'lucide-vue-next'
import { useEvents } from '@/composables/useEvents'
import { useSettings } from '@/composables/useSettings'
import EventForm from '@/components/EventForm.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import type { HistoryEvent } from '@/types'

const { events, sortedEvents, isLoading, isSaving, fetchEvents, addEvent, updateEvent, deleteEvent } =
  useEvents()
const { isConfigured } = useSettings()

const showForm = ref(false)
const editingEvent = ref<HistoryEvent | null>(null)
const deletingEventId = ref<string | null>(null)
const error = ref('')

onMounted(() => {
  if (events.value.length === 0) {
    fetchEvents()
  }
})

function handleAddNew() {
  editingEvent.value = null
  showForm.value = true
}

function handleEdit(event: HistoryEvent) {
  editingEvent.value = event
  showForm.value = true
}

function handleDeleteClick(eventId: string) {
  deletingEventId.value = eventId
}

async function handleSubmit(data: Omit<HistoryEvent, 'id'> | Partial<HistoryEvent>) {
  error.value = ''
  try {
    if (editingEvent.value) {
      await updateEvent(editingEvent.value.id, data)
    } else {
      await addEvent(data as Omit<HistoryEvent, 'id'>)
    }
    showForm.value = false
    editingEvent.value = null
  } catch (e) {
    error.value = e instanceof Error ? e.message : '保存に失敗しました'
  }
}

async function handleConfirmDelete() {
  if (!deletingEventId.value) return
  error.value = ''
  try {
    await deleteEvent(deletingEventId.value)
    deletingEventId.value = null
  } catch (e) {
    error.value = e instanceof Error ? e.message : '削除に失敗しました'
    deletingEventId.value = null
  }
}

function handleCancelForm() {
  showForm.value = false
  editingEvent.value = null
}

function handleCancelDelete() {
  deletingEventId.value = null
}

const regionLabels: Record<string, string> = {
  china: '中国',
  japan: '日本',
  europe: 'ヨーロッパ',
  middle_east: '中東',
  other: 'その他',
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-4 sm:py-8">
    <div class="mx-auto max-w-4xl px-4">
      <div class="mb-4 flex items-center justify-between sm:mb-8">
        <div class="flex items-center gap-2 sm:gap-3">
          <Pencil class="h-6 w-6 text-gray-700 sm:h-8 sm:w-8" />
          <h1 class="text-xl font-bold text-gray-900 sm:text-2xl">管理</h1>
        </div>
        <button
          v-if="isConfigured && !showForm"
          type="button"
          class="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 sm:gap-2 sm:px-4 sm:text-base"
          @click="handleAddNew"
        >
          <Plus class="h-4 w-4 sm:h-5 sm:w-5" />
          新規追加
        </button>
      </div>

      <div v-if="!isConfigured" class="rounded-lg border border-yellow-200 bg-yellow-50 p-4 sm:p-6">
        <div class="flex items-start gap-3">
          <AlertCircle class="h-5 w-5 flex-shrink-0 text-yellow-600 sm:h-6 sm:w-6" />
          <div>
            <h2 class="font-semibold text-yellow-800">GitHub 連携が必要です</h2>
            <p class="mt-1 text-sm text-yellow-700 sm:text-base">
              イベントを追加・編集・削除するには、設定画面で GitHub 連携を設定してください。
            </p>
            <router-link
              to="/settings"
              class="mt-3 inline-block rounded-md bg-yellow-600 px-4 py-2 text-sm text-white hover:bg-yellow-700 sm:text-base"
            >
              設定画面へ
            </router-link>
          </div>
        </div>
      </div>

      <div v-else-if="showForm" class="rounded-lg bg-white p-4 shadow sm:p-6">
        <h2 class="mb-4 text-lg font-semibold">
          {{ editingEvent ? 'イベントを編集' : '新規イベント' }}
        </h2>
        <div v-if="error" class="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
          {{ error }}
        </div>
        <EventForm
          :event="editingEvent || undefined"
          :is-submitting="isSaving"
          @submit="handleSubmit"
          @cancel="handleCancelForm"
        />
      </div>

      <template v-else>
        <LoadingSpinner v-if="isLoading" message="データを読み込み中..." />

        <div v-else-if="sortedEvents.length === 0" class="rounded-lg bg-white p-8 text-center shadow">
          <p class="text-gray-600">イベントがありません</p>
          <button
            type="button"
            class="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            @click="handleAddNew"
          >
            最初のイベントを追加
          </button>
        </div>

        <div v-else class="space-y-2 sm:space-y-3">
          <div v-if="error" class="rounded-md bg-red-50 p-3 text-sm text-red-800">
            {{ error }}
          </div>

          <div
            v-for="event in sortedEvents"
            :key="event.id"
            class="rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:p-4"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0 flex-1">
                <div class="mb-1 flex flex-wrap items-center gap-1 sm:gap-2">
                  <span class="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800 sm:px-2 sm:text-sm">
                    {{ event.yearDisplay }}
                  </span>
                  <span class="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-700 sm:px-2 sm:text-sm">
                    {{ event.era }}
                  </span>
                  <span class="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-800 sm:px-2 sm:text-sm">
                    {{ regionLabels[event.region] || event.region }}
                  </span>
                </div>
                <h3 class="text-sm font-medium text-gray-900 sm:text-base">{{ event.title }}</h3>
              </div>
              <div class="flex flex-shrink-0 gap-1 sm:gap-2">
                <button
                  type="button"
                  class="rounded-md p-1.5 text-gray-600 hover:bg-gray-100 sm:p-2"
                  title="編集"
                  @click="handleEdit(event)"
                >
                  <Edit2 class="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button
                  type="button"
                  class="rounded-md p-1.5 text-red-600 hover:bg-red-50 sm:p-2"
                  title="削除"
                  @click="handleDeleteClick(event.id)"
                >
                  <Trash2 class="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>

  <ConfirmDialog
    v-if="deletingEventId"
    title="イベントを削除"
    message="このイベントを削除してもよろしいですか？この操作は取り消せません。"
    confirm-text="削除"
    :is-destructive="true"
    @confirm="handleConfirmDelete"
    @cancel="handleCancelDelete"
  />
</template>
