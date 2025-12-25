import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAffiliateLink } from './useAffiliateLink'

describe('useAffiliateLink', () => {
  beforeEach(() => {
    // シングルトン状態をリセット
    const { affiliateTag, isLoaded } = useAffiliateLink()
    affiliateTag.value = ''
    isLoaded.value = false

    // fetchをモック
    vi.stubGlobal('fetch', vi.fn())
  })

  describe('loadAffiliateTag', () => {
    it('設定ファイルからアフィリエイトタグを読み込める', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ affiliateTag: 'test-tag-22' }),
      }
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response)

      const { loadAffiliateTag, affiliateTag } = useAffiliateLink()
      await loadAffiliateTag()

      expect(affiliateTag.value).toBe('test-tag-22')
    })

    it('設定ファイルが存在しない場合は空のまま', async () => {
      const mockResponse = { ok: false }
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response)

      const { loadAffiliateTag, affiliateTag } = useAffiliateLink()
      await loadAffiliateTag()

      expect(affiliateTag.value).toBe('')
    })

    it('二重読み込みを防止する', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ affiliateTag: 'test-tag' }),
      }
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response)

      const { loadAffiliateTag, isLoaded } = useAffiliateLink()
      isLoaded.value = true

      await loadAffiliateTag()

      expect(fetch).not.toHaveBeenCalled()
    })
  })

  describe('generateAffiliateUrl', () => {
    it('タグが設定されている場合、URLにタグパラメータを付与する', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ affiliateTag: 'example-22' }),
      }
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response)

      const { loadAffiliateTag, generateAffiliateUrl } = useAffiliateLink()
      await loadAffiliateTag()

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

    it('既存のURLパラメータがある場合、追加パラメータとして付与する', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ affiliateTag: 'example-22' }),
      }
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response)

      const { loadAffiliateTag, generateAffiliateUrl } = useAffiliateLink()
      await loadAffiliateTag()

      const url = 'https://www.amazon.co.jp/dp/B00X1234?ref=nav'
      const result = generateAffiliateUrl(url)

      expect(result).toContain('ref=nav')
      expect(result).toContain('tag=example-22')
    })

    it('既にtagパラメータがある場合は上書きする', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ affiliateTag: 'new-tag' }),
      }
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response)

      const { loadAffiliateTag, generateAffiliateUrl } = useAffiliateLink()
      await loadAffiliateTag()

      const url = 'https://www.amazon.co.jp/dp/B00X1234?tag=old-tag'
      const result = generateAffiliateUrl(url)

      expect(result).toContain('tag=new-tag')
      expect(result).not.toContain('old-tag')
    })

    it('空文字のURLは空文字を返す', () => {
      const { generateAffiliateUrl } = useAffiliateLink()
      expect(generateAffiliateUrl('')).toBe('')
    })

    it('不正なURLは元のURLをそのまま返す', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ affiliateTag: 'example-22' }),
      }
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response)

      const { loadAffiliateTag, generateAffiliateUrl } = useAffiliateLink()
      await loadAffiliateTag()

      const invalidUrl = 'not-a-valid-url'
      const result = generateAffiliateUrl(invalidUrl)

      expect(result).toBe(invalidUrl)
    })
  })
})
