# Historie Graph

歴史イベントをタイムラインで管理・表示するWebアプリケーション。関連する漫画・小説・映画・アニメなどのメディア情報も一緒に管理できます。

## 機能

- **タイムライン表示**: 歴史イベントを年代順に表示
- **フィルタリング**: 地域（日本、中国、ヨーロッパなど）・時代で絞り込み
- **イベント管理**: イベントの追加・編集・削除（GitHub連携時）
- **メディア管理**: 各イベントに関連するメディア（漫画、小説、映画、アニメ）を登録
- **レスポンシブデザイン**: モバイル・タブレット・デスクトップに対応
- **GitHub連携**: データをGitHubリポジトリで管理

## 技術スタック

- **フレームワーク**: Vue 3 (Composition API)
- **言語**: TypeScript
- **ビルドツール**: Vite
- **スタイリング**: Tailwind CSS
- **アイコン**: Lucide Vue Next
- **GitHub API**: Octokit

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ブラウザで http://localhost:5173 を開く
```

## ビルド

```bash
# プロダクションビルド
npm run build

# ビルド結果のプレビュー
npm run preview
```

## GitHub連携の設定

データをGitHubリポジトリで管理する場合、以下の設定が必要です。

### 1. Personal Access Token (PAT) の取得

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 「Generate new token (classic)」をクリック
3. `repo` スコープにチェックを入れて生成
4. 生成されたトークンをコピー

### 2. データ用リポジトリの準備

1. 新しいリポジトリを作成（またはフォークしたリポジトリを使用）
2. リポジトリのルートに `data.json` を配置

`data.json` の形式:

```json
{
  "events": [
    {
      "id": "uuid-here",
      "year": 1560,
      "yearDisplay": "1560年",
      "era": "戦国時代",
      "region": "japan",
      "title": "桶狭間の戦い",
      "description": "説明文...",
      "links": ["https://..."],
      "media": [
        {
          "title": "センゴク",
          "type": "manga",
          "remark": "宮下英樹作"
        }
      ]
    }
  ]
}
```

### 3. アプリケーションでの設定

1. アプリを起動し「設定」画面を開く
2. Personal Access Token、リポジトリオーナー、リポジトリ名を入力
3. 「保存」をクリック（トークンが自動検証されます）

## データ形式

### HistoryEvent

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| id | string | ○ | UUID（自動生成） |
| year | number | ○ | 年（紀元前は負数） |
| yearDisplay | string | ○ | 表示用年号（例: "前202年"） |
| era | string | ○ | 時代（例: "戦国時代"） |
| region | string | ○ | 地域（japan, china, europe, middle_east, other） |
| title | string | ○ | イベントタイトル |
| description | string | - | 説明文 |
| links | string[] | - | 参考リンク |
| media | MediaItem[] | - | 関連メディア |

### MediaItem

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| title | string | ○ | メディアタイトル |
| type | string | ○ | 種類（manga, novel, movie, anime） |
| remark | string | - | 備考（作者など） |

## ライセンス

MIT
