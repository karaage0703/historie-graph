import { ref, computed } from 'vue'
import type { AppError } from '@/types'

const currentError = ref<AppError | null>(null)

const ERROR_MESSAGES: Record<AppError['type'], string> = {
  NETWORK: 'ネットワーク接続を確認してください',
  API: 'サーバーとの通信でエラーが発生しました',
  VALIDATION: '入力内容を確認してください',
  UNKNOWN: '予期せぬエラーが発生しました',
}

export function useError() {
  const isRetryable = computed(() => {
    if (!currentError.value) return false
    return currentError.value.retryable
  })

  const userMessage = computed(() => {
    if (!currentError.value) return ''
    return currentError.value.message || ERROR_MESSAGES[currentError.value.type]
  })

  function setError(error: AppError): void {
    currentError.value = error
    console.error('[App Error]', {
      type: error.type,
      message: error.message,
      retryable: error.retryable,
      details: error.details,
    })
  }

  function createError(
    type: AppError['type'],
    message: string,
    options?: { retryable?: boolean; details?: unknown }
  ): AppError {
    return {
      type,
      message,
      retryable: options?.retryable ?? type === 'NETWORK',
      details: options?.details,
    }
  }

  function setNetworkError(message?: string, details?: unknown): void {
    setError(
      createError('NETWORK', message || ERROR_MESSAGES.NETWORK, {
        retryable: true,
        details,
      })
    )
  }

  function setApiError(message: string, details?: unknown): void {
    setError(
      createError('API', message, {
        retryable: false,
        details,
      })
    )
  }

  function setValidationError(message: string, details?: unknown): void {
    setError(
      createError('VALIDATION', message, {
        retryable: false,
        details,
      })
    )
  }

  function clearError(): void {
    currentError.value = null
  }

  return {
    currentError,
    isRetryable,
    userMessage,
    setError,
    createError,
    setNetworkError,
    setApiError,
    setValidationError,
    clearError,
  }
}
