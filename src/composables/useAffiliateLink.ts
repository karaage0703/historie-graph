import { ref } from 'vue'

// シングルトンとして状態を保持
const affiliateTag = ref('')
const isLoaded = ref(false)

export function useAffiliateLink() {
  const loadAffiliateTag = async (): Promise<void> => {
    if (isLoaded.value) return

    try {
      const response = await fetch('/config.json')
      if (response.ok) {
        const config = await response.json()
        if (config.affiliateTag) {
          affiliateTag.value = config.affiliateTag
        }
      }
      isLoaded.value = true
    } catch (e) {
      console.error('Failed to load affiliate config:', e)
      isLoaded.value = true
    }
  }

  const generateAffiliateUrl = (baseUrl: string): string => {
    if (!baseUrl) return ''
    if (!affiliateTag.value) return baseUrl

    try {
      const url = new URL(baseUrl)
      // 既存のtagパラメータを上書き
      url.searchParams.set('tag', affiliateTag.value)
      return url.toString()
    } catch {
      // 不正なURLの場合は元のURLを返す
      return baseUrl
    }
  }

  return {
    affiliateTag,
    isLoaded,
    loadAffiliateTag,
    generateAffiliateUrl,
  }
}
