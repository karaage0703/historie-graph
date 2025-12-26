# Issue Processing Guidelines

このドキュメントでは、GitHub issueを通じた作品・イベント追加リクエストの処理方法を説明します。

## 処理フロー

### 1. issueの取得

```bash
# 特定のissueを取得
gh issue view <issue番号> --json number,title,body,labels

# 処理対象のissueを一覧取得
gh issue list --label "media-request" --state open --json number,title,body,labels
gh issue list --label "event-request" --state open --json number,title,body,labels
```

### 2. ラベルによる分岐

- `media-request`: 作品追加リクエスト
- `event-request`: 歴史イベント追加リクエスト

### 3. データ抽出

GitHub issue formのフィールドは `### フィールド名` の形式で本文に記載されています。

#### 作品追加リクエストのフィールド
| フィールド | 説明 |
|-----------|------|
| 作品名 | 作品の正式名称 |
| 作品の種類 | manga または novel |
| 備考 | 作者名や補足情報 |
| 作品が扱う年代（開始） | 西暦（紀元前は負数） |
| 作品が扱う年代（終了） | 西暦（紀元前は負数） |
| Kindle URL | Amazon KindleのURL |
| 関連する地域 | china, japan, europe, middle_east, other |
| 関連する時代 | 時代名 |
| 紐付けるイベントID | 関連イベントのID（複数可） |

#### イベント追加リクエストのフィールド
| フィールド | 説明 |
|-----------|------|
| イベント名 | 歴史イベントのタイトル |
| 年代（西暦） | 西暦（紀元前は負数） |
| 年代（表示用） | 表示用の年代表記 |
| 地域 | china, japan, europe, middle_east, other |
| 時代名 | このイベントが属する時代 |
| 説明 | イベントの説明文 |
| 参考リンク | Wikipedia等のURL |
| 関連作品 | 関連する作品名（参考情報） |

## データ形式

### data.json の構造

```json
{
  "events": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "year": -221,
      "yearDisplay": "前221年",
      "era": "秦",
      "region": "china",
      "title": "秦の統一",
      "description": "始皇帝が中国を統一",
      "links": ["https://ja.wikipedia.org/wiki/秦"]
    }
  ],
  "media": [
    {
      "id": "kingdom",
      "title": "キングダム",
      "type": "manga",
      "remark": "原泰久作",
      "coverageStartYear": -259,
      "coverageEndYear": -221,
      "kindleUrl": "https://www.amazon.co.jp/...",
      "relatedEventIds": ["550e8400-e29b-41d4-a716-446655440000"]
    }
  ]
}
```

### 作品データ (MediaItem)

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| id | string | ○ | ユニークID（kebab-case形式） |
| title | string | ○ | 作品タイトル |
| type | string | ○ | 種類（manga, novel） |
| remark | string | ○ | 備考（作者など） |
| coverageStartYear | number | - | 扱う時代の開始年 |
| coverageEndYear | number | - | 扱う時代の終了年 |
| kindleUrl | string | - | Amazon KindleのURL |
| relatedEventIds | string[] | ○ | 関連イベントのID配列 |

#### IDの生成ルール
- 作品名をローマ字/英語のkebab-case形式に変換
- 例:
  - "キングダム" → `kingdom`
  - "三国志" → `sangokushi`
  - "項羽と劉邦" → `kouu-to-ryuuhou`

### イベントデータ (HistoryEvent)

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| id | string | ○ | UUID形式 |
| year | number | ○ | 年（紀元前は負数） |
| yearDisplay | string | ○ | 表示用年号 |
| era | string | ○ | 時代名 |
| region | string | ○ | 地域コード |
| title | string | ○ | イベントタイトル |
| description | string | - | 説明文 |
| links | string[] | - | 参考リンク |

## 処理後のアクション

1. **ブランチ作成**: `issue-<番号>`
2. **data.jsonの更新**:
   - イベント: `events` 配列に追加（年代順ソート維持）
   - 作品: `media` 配列に追加
3. **コミット**: `[Auto] Close #<番号> - <作品名 or イベント名>`
4. **PR作成**: 元issueをクローズするようリンク

## 注意事項

- 重複チェック: 同名の作品/イベントが既に存在しないか確認
- 年代順ソート: イベントは `year` フィールドで昇順ソート
- 地域コード: `china`, `japan`, `europe`, `middle_east`, `other` のいずれか
- メディアタイプ: `manga`, `novel` のみ（映画・アニメは対象外）
