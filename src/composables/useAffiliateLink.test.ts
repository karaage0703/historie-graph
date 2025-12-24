import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAffiliateLink } from './useAffiliateLink'

describe('useAffiliateLink', () => {
  beforeEach(() => {
    // LocalStorageをモック
    const storage: Record<string, string> = {}
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(
      (key) => storage[key] || null
    )
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      storage[key] = value
    })
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key) => {
      delete storage[key]
    })

    // シングルトン状態をリセット
    const { clearAffiliateTag } = useAffiliateLink()
    clearAffiliateTag()
  })

  describe('affiliateTag管理', () => {
    it('初期状態では空文字', () => {
      const { affiliateTag } = useAffiliateLink()
      expect(affiliateTag.value).toBe('')
    })

    it('saveAffiliateTagでタグを保存できる', () => {
      const { affiliateTag, saveAffiliateTag } = useAffiliateLink()
      saveAffiliateTag('example-22')
      expect(affiliateTag.value).toBe('example-22')
    })

    it('clearAffiliateTagでタグをクリアできる', () => {
      const { affiliateTag, saveAffiliateTag, clearAffiliateTag } =
        useAffiliateLink()
      saveAffiliateTag('example-22')
      clearAffiliateTag()
      expect(affiliateTag.value).toBe('')
    })

    it('loadAffiliateTagでLocalStorageから読み込める', () => {
      const { saveAffiliateTag } = useAffiliateLink()
      saveAffiliateTag('saved-tag')

      // 新しいインスタンスで読み込み
      const { affiliateTag, loadAffiliateTag } = useAffiliateLink()
      loadAffiliateTag()
      expect(affiliateTag.value).toBe('saved-tag')
    })
  })

  describe('generateAffiliateUrl', () => {
    it('タグが設定されている場合、URLにタグパラメータを付与する', () => {
      const { saveAffiliateTag, generateAffiliateUrl } = useAffiliateLink()
      saveAffiliateTag('example-22')

      const url = 'https://www.amazon.co.jp/dp/B00X1234'
      const result = generateAffiliateUrl(url)

      expect(result).toContain('tag=example-22')
    })

    it('タグが未設定の場合、元URLをそのまま返す', () => {
      const { generateAffiliateUrl } = useAffiliateLink()

      const url = 'https://www.amazon.co.jp/dp/B00X1234'
      const result = generateAffiliateUrl(url)

      expect(result).toBe(url)
    })

    it('既存のURLパラメータがある場合、追加パラメータとして付与する', () => {
      const { saveAffiliateTag, generateAffiliateUrl } = useAffiliateLink()
      saveAffiliateTag('example-22')

      const url = 'https://www.amazon.co.jp/dp/B00X1234?ref=nav'
      const result = generateAffiliateUrl(url)

      expect(result).toContain('ref=nav')
      expect(result).toContain('tag=example-22')
      expect(result).toContain('&tag=')
    })

    it('既にtagパラメータがある場合は上書きする', () => {
      const { saveAffiliateTag, generateAffiliateUrl } = useAffiliateLink()
      saveAffiliateTag('new-tag')

      const url = 'https://www.amazon.co.jp/dp/B00X1234?tag=old-tag'
      const result = generateAffiliateUrl(url)

      expect(result).toContain('tag=new-tag')
      expect(result).not.toContain('old-tag')
    })

    it('空文字のURLは空文字を返す', () => {
      const { generateAffiliateUrl } = useAffiliateLink()
      expect(generateAffiliateUrl('')).toBe('')
    })

    it('不正なURLは元のURLをそのまま返す', () => {
      const { saveAffiliateTag, generateAffiliateUrl } = useAffiliateLink()
      saveAffiliateTag('example-22')

      const invalidUrl = 'not-a-valid-url'
      const result = generateAffiliateUrl(invalidUrl)

      expect(result).toBe(invalidUrl)
    })
  })
})
