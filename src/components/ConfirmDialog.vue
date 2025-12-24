<script setup lang="ts">
import { AlertTriangle, X } from 'lucide-vue-next'

defineProps<{
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div class="w-full max-w-md rounded-lg bg-white shadow-xl">
      <div class="flex items-start gap-4 border-b p-4">
        <div
          class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
          :class="isDestructive ? 'bg-red-100' : 'bg-yellow-100'"
        >
          <AlertTriangle
            class="h-6 w-6"
            :class="isDestructive ? 'text-red-600' : 'text-yellow-600'"
          />
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
          <p class="mt-1 text-sm text-gray-600">{{ message }}</p>
        </div>
        <button
          type="button"
          class="text-gray-400 hover:text-gray-600"
          @click="emit('cancel')"
        >
          <X class="h-5 w-5" />
        </button>
      </div>
      <div class="flex justify-end gap-3 p-4">
        <button
          type="button"
          class="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
          @click="emit('cancel')"
        >
          {{ cancelText || 'キャンセル' }}
        </button>
        <button
          type="button"
          class="rounded-md px-4 py-2 text-white"
          :class="isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'"
          @click="emit('confirm')"
        >
          {{ confirmText || '確認' }}
        </button>
      </div>
    </div>
  </div>
</template>
