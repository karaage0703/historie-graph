<script setup lang="ts">
import { AlertCircle, RefreshCw, X } from 'lucide-vue-next'
import { useError } from '@/composables/useError'

const props = defineProps<{
  onRetry?: () => void
}>()

const { currentError, userMessage, isRetryable, clearError } = useError()

function handleRetry() {
  if (props.onRetry) {
    clearError()
    props.onRetry()
  }
}
</script>

<template>
  <div
    v-if="currentError"
    class="rounded-md border border-red-200 bg-red-50 p-4"
    role="alert"
  >
    <div class="flex items-start gap-3">
      <AlertCircle class="h-5 w-5 flex-shrink-0 text-red-600" />
      <div class="flex-1">
        <p class="text-sm font-medium text-red-800">
          {{ userMessage }}
        </p>
        <div v-if="isRetryable && onRetry" class="mt-3">
          <button
            type="button"
            class="flex items-center gap-1.5 rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200"
            @click="handleRetry"
          >
            <RefreshCw class="h-4 w-4" />
            再試行
          </button>
        </div>
      </div>
      <button
        type="button"
        class="flex-shrink-0 text-red-500 hover:text-red-700"
        @click="clearError"
      >
        <X class="h-5 w-5" />
      </button>
    </div>
  </div>
</template>
