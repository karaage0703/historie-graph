import { ref } from 'vue'

const STORAGE_KEY = 'historie-graph-affiliate-tag'

// シングルトンとして状態を保持
const affiliateTag = ref('')

export function useAffiliateLink() {
  const loadAffiliateTag = (): void => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        affiliateTag.value = stored
      }
    } catch (e) {
      console.error('Failed to load affiliate tag:', e)
    }
  }

  const saveAffiliateTag = (tag: string): void => {
    affiliateTag.value = tag
    try {
      localStorage.setItem(STORAGE_KEY, tag)
    } catch (e) {
      console.error('Failed to save affiliate tag:', e)
    }
  }

  const clearAffiliateTag = (): void => {
    affiliateTag.value = ''
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (e) {
      console.error('Failed to clear affiliate tag:', e)
    }
  }

  const generateAffiliateUrl = (baseUrl: string): string => {
    if (!baseUrl) return ''
    if (!affiliateTag.value) return baseUrl

    try {
      const url = new URL(baseUrl)
      url.searchParams.set('tag', affiliateTag.value)
      return url.toString()
    } catch {
      // 不正なURLの場合は元のURLを返す
      return baseUrl
    }
  }

  return {
    affiliateTag,
    loadAffiliateTag,
    saveAffiliateTag,
    clearAffiliateTag,
    generateAffiliateUrl,
  }
}
