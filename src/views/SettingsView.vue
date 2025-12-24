<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSettings } from '@/composables/useSettings'
import { useGithubApi } from '@/composables/useGithubApi'
import { useAffiliateLink } from '@/composables/useAffiliateLink'
import { Settings, Trash2, Save, Eye, EyeOff, Loader2, Tag } from 'lucide-vue-next'

const { token, owner, repo, isConfigured, saveSettings, clearToken } = useSettings()
const { validateToken, lastError, clearSha } = useGithubApi()
const { affiliateTag, loadAffiliateTag, saveAffiliateTag, clearAffiliateTag } = useAffiliateLink()

const formToken = ref(token.value)
const formOwner = ref(owner.value)
const formRepo = ref(repo.value)
const formAffiliateTag = ref('')
const showToken = ref(false)
const error = ref('')
const success = ref('')
const affiliateSuccess = ref('')
const isValidating = ref(false)

onMounted(() => {
  loadAffiliateTag()
  formAffiliateTag.value = affiliateTag.value
})

async function handleSave() {
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

  isValidating.value = true

  saveSettings({
    token: formToken.value.trim(),
    owner: formOwner.value.trim(),
    repo: formRepo.value.trim(),
  })

  const isValid = await validateToken()
  isValidating.value = false

  if (!isValid) {
    error.value = lastError.value?.message || 'トークンの検証に失敗しました'
    clearToken()
    return
  }

  success.value = '設定を保存しました（トークン検証済み）'
  setTimeout(() => {
    success.value = ''
  }, 3000)
}

function handleClear() {
  clearToken()
  clearSha()
  formToken.value = ''
  formOwner.value = ''
  formRepo.value = ''
  success.value = '設定を削除しました'
  setTimeout(() => {
    success.value = ''
  }, 3000)
}

function handleSaveAffiliate() {
  if (formAffiliateTag.value.trim()) {
    saveAffiliateTag(formAffiliateTag.value.trim())
  } else {
    clearAffiliateTag()
  }
  affiliateSuccess.value = 'アフィリエイト設定を保存しました'
  setTimeout(() => {
    affiliateSuccess.value = ''
  }, 3000)
}

function handleClearAffiliate() {
  clearAffiliateTag()
  formAffiliateTag.value = ''
  affiliateSuccess.value = 'アフィリエイト設定を削除しました'
  setTimeout(() => {
    affiliateSuccess.value = ''
  }, 3000)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-4 sm:py-8">
    <div class="mx-auto max-w-2xl px-4">
      <div class="mb-4 flex items-center gap-2 sm:mb-8 sm:gap-3">
        <Settings class="h-6 w-6 text-gray-700 sm:h-8 sm:w-8" />
        <h1 class="text-xl font-bold text-gray-900 sm:text-2xl">設定</h1>
      </div>

      <div class="rounded-lg bg-white p-4 shadow sm:p-6">
        <h2 class="mb-4 text-base font-semibold text-gray-800 sm:text-lg">GitHub 連携設定</h2>

        <div v-if="isConfigured" class="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-800">
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
                class="w-full rounded-md border border-gray-300 px-3 py-2.5 pr-10 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:py-2 sm:text-sm"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              />
              <button
                type="button"
                class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
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
              class="w-full rounded-md border border-gray-300 px-3 py-2.5 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:py-2 sm:text-sm"
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
              class="w-full rounded-md border border-gray-300 px-3 py-2.5 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:py-2 sm:text-sm"
              placeholder="repository-name"
            />
          </div>

          <div v-if="error" class="rounded-md bg-red-50 p-3 text-sm text-red-800">
            {{ error }}
          </div>

          <div v-if="success" class="rounded-md bg-green-50 p-3 text-sm text-green-800">
            {{ success }}
          </div>

          <div class="flex flex-col gap-3 pt-4 sm:flex-row">
            <button
              type="submit"
              :disabled="isValidating"
              class="flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:py-2"
            >
              <Loader2 v-if="isValidating" class="h-4 w-4 animate-spin" />
              <Save v-else class="h-4 w-4" />
              {{ isValidating ? '検証中...' : '保存' }}
            </button>
            <button
              type="button"
              class="flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2.5 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:py-2"
              @click="handleClear"
            >
              <Trash2 class="h-4 w-4" />
              削除
            </button>
          </div>
        </form>
      </div>

      <!-- アフィリエイト設定 -->
      <div class="mt-6 rounded-lg bg-white p-4 shadow sm:p-6">
        <h2 class="mb-4 flex items-center gap-2 text-base font-semibold text-gray-800 sm:text-lg">
          <Tag class="h-5 w-5" />
          Amazonアソシエイト設定
        </h2>

        <div v-if="affiliateTag" class="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-800">
          アフィリエイトタグが設定されています: {{ affiliateTag }}
        </div>

        <form class="space-y-4" @submit.prevent="handleSaveAffiliate">
          <div>
            <label for="affiliateTag" class="mb-1 block text-sm font-medium text-gray-700">
              アソシエイトタグ（トラッキングID）
            </label>
            <input
              id="affiliateTag"
              v-model="formAffiliateTag"
              type="text"
              class="w-full rounded-md border border-gray-300 px-3 py-2.5 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:py-2 sm:text-sm"
              placeholder="example-22"
            />
            <p class="mt-1 text-xs text-gray-500">
              Amazonアソシエイトのタグを入力すると、Kindleリンクに自動付与されます
            </p>
          </div>

          <div v-if="affiliateSuccess" class="rounded-md bg-green-50 p-3 text-sm text-green-800">
            {{ affiliateSuccess }}
          </div>

          <div class="flex flex-col gap-3 pt-4 sm:flex-row">
            <button
              type="submit"
              class="flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:py-2"
            >
              <Save class="h-4 w-4" />
              保存
            </button>
            <button
              type="button"
              class="flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2.5 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:py-2"
              @click="handleClearAffiliate"
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
