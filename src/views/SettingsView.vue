<script setup lang="ts">
import { ref } from 'vue'
import { useSettings } from '@/composables/useSettings'
import { Settings, Trash2, Save, Eye, EyeOff } from 'lucide-vue-next'

const { token, owner, repo, isConfigured, saveSettings, clearToken } = useSettings()

const formToken = ref(token.value)
const formOwner = ref(owner.value)
const formRepo = ref(repo.value)
const showToken = ref(false)
const error = ref('')
const success = ref('')

function handleSave() {
  error.value = ''
  success.value = ''

  if (!formToken.value.trim()) {
    error.value = 'GitHub Personal Access Token を入力してください'
    return
  }
  if (!formOwner.value.trim()) {
    error.value = 'リポジトリオーナーを入力してください'
    return
  }
  if (!formRepo.value.trim()) {
    error.value = 'リポジトリ名を入力してください'
    return
  }

  saveSettings({
    token: formToken.value.trim(),
    owner: formOwner.value.trim(),
    repo: formRepo.value.trim(),
  })

  success.value = '設定を保存しました'
  setTimeout(() => {
    success.value = ''
  }, 3000)
}

function handleClear() {
  clearToken()
  formToken.value = ''
  formOwner.value = ''
  formRepo.value = ''
  success.value = '設定を削除しました'
  setTimeout(() => {
    success.value = ''
  }, 3000)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="mx-auto max-w-2xl px-4">
      <div class="mb-8 flex items-center gap-3">
        <Settings class="h-8 w-8 text-gray-700" />
        <h1 class="text-2xl font-bold text-gray-900">設定</h1>
      </div>

      <div class="rounded-lg bg-white p-6 shadow">
        <h2 class="mb-4 text-lg font-semibold text-gray-800">GitHub 連携設定</h2>

        <div v-if="isConfigured" class="mb-4 rounded-md bg-green-50 p-3 text-green-800">
          GitHub 連携が設定されています
        </div>

        <form class="space-y-4" @submit.prevent="handleSave">
          <div>
            <label for="token" class="mb-1 block text-sm font-medium text-gray-700">
              Personal Access Token
            </label>
            <div class="relative">
              <input
                id="token"
                v-model="formToken"
                :type="showToken ? 'text' : 'password'"
                class="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              />
              <button
                type="button"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                @click="showToken = !showToken"
              >
                <Eye v-if="!showToken" class="h-5 w-5" />
                <EyeOff v-else class="h-5 w-5" />
              </button>
            </div>
            <p class="mt-1 text-xs text-gray-500">
              repo スコープのトークンが必要です
            </p>
          </div>

          <div>
            <label for="owner" class="mb-1 block text-sm font-medium text-gray-700">
              リポジトリオーナー
            </label>
            <input
              id="owner"
              v-model="formOwner"
              type="text"
              class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="username または organization"
            />
          </div>

          <div>
            <label for="repo" class="mb-1 block text-sm font-medium text-gray-700">
              リポジトリ名
            </label>
            <input
              id="repo"
              v-model="formRepo"
              type="text"
              class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="repository-name"
            />
          </div>

          <div v-if="error" class="rounded-md bg-red-50 p-3 text-red-800">
            {{ error }}
          </div>

          <div v-if="success" class="rounded-md bg-green-50 p-3 text-green-800">
            {{ success }}
          </div>

          <div class="flex gap-3 pt-4">
            <button
              type="submit"
              class="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Save class="h-4 w-4" />
              保存
            </button>
            <button
              type="button"
              class="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              @click="handleClear"
            >
              <Trash2 class="h-4 w-4" />
              削除
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
