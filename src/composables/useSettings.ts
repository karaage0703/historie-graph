import { ref, computed, onMounted } from 'vue'
import type { GithubSettings } from '@/types'

const STORAGE_KEY = 'historie-graph-settings'

const token = ref('')
const owner = ref('')
const repo = ref('')

export function useSettings() {
  const isConfigured = computed(() => {
    return token.value.length > 0 && owner.value.length > 0 && repo.value.length > 0
  })

  function loadSettings(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const settings: GithubSettings = JSON.parse(stored)
        token.value = settings.token || ''
        owner.value = settings.owner || ''
        repo.value = settings.repo || ''
      }
    } catch (e) {
      console.error('Failed to load settings:', e)
    }
  }

  function saveSettings(settings: GithubSettings): void {
    token.value = settings.token
    owner.value = settings.owner
    repo.value = settings.repo
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch (e) {
      console.error('Failed to save settings:', e)
    }
  }

  function clearToken(): void {
    token.value = ''
    owner.value = ''
    repo.value = ''
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (e) {
      console.error('Failed to clear settings:', e)
    }
  }

  onMounted(() => {
    loadSettings()
  })

  return {
    token,
    owner,
    repo,
    isConfigured,
    saveSettings,
    clearToken,
    loadSettings,
  }
}
