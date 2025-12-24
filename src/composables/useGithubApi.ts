import { ref } from 'vue'
import { Octokit } from 'octokit'
import type { HistoryEvent, GithubApiError, SaveResult } from '@/types'
import { useSettings } from './useSettings'

const isSaving = ref(false)
const lastError = ref<GithubApiError | null>(null)
let currentSha = ''

function createOctokitInstance(token: string): Octokit {
  return new Octokit({ auth: token })
}

function parseGithubError(error: unknown): GithubApiError {
  if (error instanceof Error && 'status' in error) {
    const status = (error as { status: number }).status
    switch (status) {
      case 401:
        return { code: 'UNAUTHORIZED', message: 'トークンが無効です', status }
      case 404:
        return { code: 'NOT_FOUND', message: 'リポジトリまたはファイルが見つかりません', status }
      case 409:
        return { code: 'CONFLICT', message: 'データが更新されています。再読み込みしてください', status }
      case 429:
        return { code: 'RATE_LIMIT', message: 'API制限に達しました。しばらくお待ちください', status }
      default:
        return { code: 'UNKNOWN', message: `APIエラー: ${error.message}`, status }
    }
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return { code: 'NETWORK', message: 'ネットワーク接続を確認してください' }
  }

  return {
    code: 'UNKNOWN',
    message: error instanceof Error ? error.message : '不明なエラーが発生しました',
  }
}

export function useGithubApi() {
  const { token, owner, repo, isConfigured } = useSettings()

  async function fetchData(): Promise<HistoryEvent[]> {
    lastError.value = null

    if (!isConfigured.value) {
      const response = await fetch('/data.json')
      if (!response.ok) {
        throw new Error('ローカルデータの読み込みに失敗しました')
      }
      const data = await response.json()
      return data.events as HistoryEvent[]
    }

    try {
      const octokit = createOctokitInstance(token.value)
      const response = await octokit.rest.repos.getContent({
        owner: owner.value,
        repo: repo.value,
        path: 'public/data.json',
      })

      if (Array.isArray(response.data) || response.data.type !== 'file') {
        throw new Error('data.jsonが見つかりません')
      }

      currentSha = response.data.sha
      const content = atob(response.data.content)
      const data = JSON.parse(content)
      return data.events as HistoryEvent[]
    } catch (error) {
      const apiError = parseGithubError(error)
      lastError.value = apiError
      console.error('GitHub API error:', error)
      throw error
    }
  }

  async function saveData(events: HistoryEvent[]): Promise<SaveResult> {
    if (!isConfigured.value) {
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'GitHub設定が必要です' },
      }
    }

    isSaving.value = true
    lastError.value = null

    try {
      const octokit = createOctokitInstance(token.value)

      if (!currentSha) {
        const getResponse = await octokit.rest.repos.getContent({
          owner: owner.value,
          repo: repo.value,
          path: 'public/data.json',
        })

        if (Array.isArray(getResponse.data) || getResponse.data.type !== 'file') {
          throw new Error('data.jsonが見つかりません')
        }
        currentSha = getResponse.data.sha
      }

      const jsonContent = JSON.stringify({ events }, null, 2)
      const base64Content = btoa(unescape(encodeURIComponent(jsonContent)))

      const response = await octokit.rest.repos.createOrUpdateFileContents({
        owner: owner.value,
        repo: repo.value,
        path: 'public/data.json',
        message: 'Update history events via historie-graph',
        content: base64Content,
        sha: currentSha,
      })

      currentSha = response.data.content?.sha || ''

      return { success: true, sha: currentSha }
    } catch (error) {
      const apiError = parseGithubError(error)
      lastError.value = apiError
      console.error('GitHub API save error:', error)
      return { success: false, error: apiError }
    } finally {
      isSaving.value = false
    }
  }

  async function validateToken(): Promise<boolean> {
    if (!isConfigured.value) {
      return false
    }

    try {
      const octokit = createOctokitInstance(token.value)
      const response = await octokit.rest.repos.getContent({
        owner: owner.value,
        repo: repo.value,
        path: 'public/data.json',
      })

      if (Array.isArray(response.data) || response.data.type !== 'file') {
        lastError.value = { code: 'NOT_FOUND', message: 'data.jsonが見つかりません' }
        return false
      }

      currentSha = response.data.sha
      return true
    } catch (error) {
      const apiError = parseGithubError(error)
      lastError.value = apiError
      return false
    }
  }

  function clearSha(): void {
    currentSha = ''
  }

  return {
    isSaving,
    lastError,
    fetchData,
    saveData,
    validateToken,
    clearSha,
  }
}
